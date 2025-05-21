import axios, { AxiosInstance, AxiosResponse } from 'axios';
import querystring from 'querystring';
import { BaseTokenResponse } from './api-dtos/base-token-response';
import { GetMeasureResponse } from './api-dtos/get-measure-response';
import { GetStationDataResponse } from './api-dtos/get-station-data-response';
import { BaseModule, Measurements } from './domain';
import { StationData } from './domain/station-data';
import { NetatmoApiError } from './errors/api-error';
import { DefaultLogger, Logger } from './logger';
import { MeasurementsMapper } from './measurements-mapper';
import { StationDataMapper } from './station-data-mapper';
import * as https from 'https';

export class NetatmoApiClient {
  private static readonly NETATMO_BASE_URL = 'https://api.netatmo.com';
  private static readonly DEFAULT_TOKEN_EXPIRATION = 1 * 60 * 60 * 1000; // default is 3 hours but we use 1 hour to be safe
  private readonly http: AxiosInstance;

  private accessToken!: string;
  private refreshToken!: string;
  private expirationTimestamp!: number;
  private tokenRefreshRequestCount = 0;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private tokenExpirationThresholdInMinutes: number = 1,
    private readonly logger: Logger = new DefaultLogger()
  ) {
    this.http = axios.create({
      httpsAgent: new https.Agent({
        ALPNProtocols: ['h2', 'http/1.1']
      })
    });
    this.http.interceptors.request.use((req) => {
      req.headers['Authorization'] = `Bearer ${this.accessToken}`;
      return req;
    });
  }

  public setTokens(
    accessToken: string,
    refreshToken: string,
    expirationInMs: number = NetatmoApiClient.DEFAULT_TOKEN_EXPIRATION
  ): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expirationTimestamp = Date.now() + expirationInMs;
  }

  public getTokens(): { accessToken: string; refreshToken: string; expiration: number } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiration: this.expirationTimestamp,
    };
  }

  public async refreshTokens(): Promise<void> {
    // refresh the token 1 minute early to be safe
    const expirationTimestampMinusThreshold = this.expirationTimestamp - 60 * 1000 * this.tokenExpirationThresholdInMinutes;
    const tokenIsAboutToExpire = Date.now() > expirationTimestampMinusThreshold;

    if (tokenIsAboutToExpire) {
      this.logger.log('Refreshing token...');
      const payload = {
        /* eslint-disable @typescript-eslint/camelcase */
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        /* eslint-enable @typescript-eslint/camelcase */
      };

      const res = await this.http.post<BaseTokenResponse>(
        `${NetatmoApiClient.NETATMO_BASE_URL}/oauth2/token`,
        querystring.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.saveTokens(res.data);
    } else {
      this.logger.log(
        `Token is still valid: "${new Date().toLocaleString()}" (now) is before "${new Date(
          expirationTimestampMinusThreshold
        ).toLocaleString()} (token expiry)"`
      );
    }
  }

  private saveTokens(res: BaseTokenResponse): void {
    this.accessToken = res.access_token;
    this.refreshToken = res.refresh_token;
    this.expirationTimestamp = Date.now() + res.expires_in * 1000;

    this.logger.log(`Got new access token expiring at ${new Date(this.expirationTimestamp).toLocaleString()}`);
  }

  public async getStationData(favorites = false): Promise<StationData> {
    this.logger.log('Requesting station data');
    await this.refreshTokens();
    this.tokenRefreshRequestCount++;
    this.logger.log(`Request count: ${this.tokenRefreshRequestCount}`);
    const res = await this.wrapAxiosErrors('get station data', () =>
      this.http.get<GetStationDataResponse>(`${NetatmoApiClient.NETATMO_BASE_URL}/api/getstationsdata`, {
        params: {
          get_favorites: favorites, // eslint-disable-line @typescript-eslint/camelcase
        },
      })
    );

    return StationDataMapper.dtoToDomain(res.data.body);
  }

  public async getMeasure(
    stationId: string,
    module: BaseModule,
    dateBegin?: Date,
    dateEnd?: Date,
    scale = '5min',
    limit = 1024,
    realTime = true
  ): Promise<Measurements> {
    this.logger.log(
      `Requesting measure for station ${stationId} and module ${module.id} from ${dateBegin} until ${dateEnd}`
    );
    this.tokenRefreshRequestCount++;
    this.logger.log(`Request count: ${this.tokenRefreshRequestCount}`);
    await this.refreshTokens();

    const payload = {
      /* eslint-disable @typescript-eslint/camelcase */
      device_id: stationId,
      module_id: module.id,
      scale,
      type: MeasurementsMapper.mapCapabilitiesToType(...module.capabilities),
      date_begin: dateBegin ? dateBegin.getTime() / 1000 : undefined,
      date_end: dateEnd ? dateEnd.getTime() / 1000 : undefined,
      limit,
      optimize: false,
      real_time: realTime,
      /* eslint-enable @typescript-eslint/camelcase */
    };

    const res = await this.wrapAxiosErrors('get measure', () =>
      this.http.get<GetMeasureResponse>(`${NetatmoApiClient.NETATMO_BASE_URL}/api/getmeasure`, {
        params: payload,
      })
    );
    return MeasurementsMapper.dtoToDomain(res.data.body, module.capabilities);
  }

  private async wrapAxiosErrors<T>(
    action: string,
    axiosCall: () => Promise<AxiosResponse<T>>
  ): Promise<AxiosResponse<T>> {
    try {
      return await axiosCall();
    } catch (e) {
      this.logger.log(`Request count: ${this.tokenRefreshRequestCount}`);
      if (axios.isAxiosError(e)) {
        if (e.response) {
          const msg = `Got error response for '${action}'`;
          this.logger.error(msg);
          throw new NetatmoApiError(msg, e.response.status, e.response.data, e);
        } else if (e.request) {
          const msg = `No response received for '${action}'`;
          this.logger.error(msg);
          throw new NetatmoApiError(msg, 500, e.request, e);
        } else {
          const msg = `Error setting up the request for '${action}'`;
          this.logger.error(msg);
          throw new NetatmoApiError(msg, 500, e.message, e);
        }
      } else {
        const msg = `Unknown error: ${e}`;
        this.logger.error(msg);
        throw new Error(msg);
      }
    }
  }
}
