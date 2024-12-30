import axios, { AxiosError, AxiosInstance } from 'axios';
import querystring from 'querystring';
import { BaseTokenResponse } from './api-dtos/base-token-response';
import { GetMeasureResponse } from './api-dtos/get-measure-response';
import { GetStationDataResponse } from './api-dtos/get-station-data-response';
import { BaseModule, Measurements } from './domain';
import { StationData } from './domain/station-data';
import { DefaultLogger, Logger } from './logger';
import { MeasurementsMapper } from './measurements-mapper';
import { StationDataMapper } from './station-data-mapper';

export class NetatmoApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number,
    public readonly data: any
  ) {
    super();
  }
}

export class NetatmoApiClient {
  private static readonly NETATMO_BASE_URL = 'https://api.netatmo.com';
  private static readonly DEFAULT_TOKEN_EXPIRATION = 1 * 60 * 60 * 1000; // default is 3 hours but we use 1 hour to be safe
  private readonly http: AxiosInstance;

  private accessToken!: string;
  private refreshToken!: string;
  private expiration!: number;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly logger: Logger = new DefaultLogger()
  ) {
    this.http = axios.create();
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
    this.expiration = Date.now() + expirationInMs;
  }

  public getTokens(): { accessToken: string; refreshToken: string; expiration: number } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiration: this.expiration,
    };
  }

  public async refreshTokens(): Promise<void> {
    // refresh the token 1 minute early to be safe
    if (Date.now() > this.expiration - 60 * 1000) {
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
      this.logger.log('Not refreshing token with calculation: '+(Date.now() > this.expiration - 60 * 1000)+ 'and '+Date.now()+' > '+ (this.expiration - 60 * 1000));
    }
  }

  private saveTokens(res: BaseTokenResponse): void {
    this.accessToken = res.access_token;
    this.refreshToken = res.refresh_token;
    this.expiration = Date.now() + res.expires_in * 1000;

    this.logger.log(`Got new access token expiring at ${new Date(this.expiration).toLocaleString()}`);
  }

  public async getStationData(favorites = false): Promise<StationData> {
    await this.refreshTokens();

    try {
      const res = await this.http.get<GetStationDataResponse>(
        `${NetatmoApiClient.NETATMO_BASE_URL}/api/getstationsdata`,
        {
          params: {
            get_favorites: favorites, // eslint-disable-line @typescript-eslint/camelcase
          },
        }
      );

      return StationDataMapper.dtoToDomain(res.data.body);
    } catch (e) {
      this.logError(e);
      if (axios.isAxiosError(e) && e.response) {
        throw new NetatmoApiError(
          'Error getting stations data - axios',
          e.response.status,
          e.response.data
        );
      }
      throw new NetatmoApiError(
        'Error getting stations data',
        500,
        e
      );
    }
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

    try {
      const res = await this.http.get<GetMeasureResponse>(`${NetatmoApiClient.NETATMO_BASE_URL}/api/getmeasure`, {
        params: payload,
      });
      return MeasurementsMapper.dtoToDomain(res.data.body, module.capabilities);
    } catch (e) {
      this.logError(e);
      if (axios.isAxiosError(e) && e.response) {
        throw new NetatmoApiError(
          'Error getting measure - axios',
          e.response.status,
          e.response.data
        );
      }
      throw new NetatmoApiError(
        'Error getting measure',
        500,
        e
      );
    }
  }

  private logError(e: AxiosError): void {
    this.logger.error(e.message);
    if (e.response) {
      this.logger.error('Response: ' + JSON.stringify(e.response.data, undefined, 2));
    }
  }
}
