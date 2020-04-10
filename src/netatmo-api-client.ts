import axios, { AxiosInstance } from 'axios';
import querystring from 'querystring';
import { BaseTokenResponse } from './api-dtos/base-token-response';
import { GetStationDataResponse } from './api-dtos/get-station-data-response';
import { NetatmoOauthScope } from './api-dtos/netatmo-oauth-scope.enum';
import { PasswordGrantResponse } from './api-dtos/password-grant-response';
import { StationData } from './domain/station-data';
import { DomainMapper } from './dto-to-domain-mapper';
import { DefaultLogger, Logger } from './logger';

export class NetatmoApiClient {
  private static readonly NETATMO_BASE_URL = 'https://api.netatmo.com';
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
  }

  public async login(
    username: string,
    password: string,
    scopes: NetatmoOauthScope[] = [NetatmoOauthScope.READ_STATION]
  ): Promise<void> {
    this.logger.log('Logging in...');

    const payload = {
      /* eslint-disable @typescript-eslint/camelcase */
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      /* eslint-enable @typescript-eslint/camelcase */
      username: username,
      password: password,
      scope: scopes.join(' '),
    };

    const res = await this.http.post<PasswordGrantResponse>(
      `${NetatmoApiClient.NETATMO_BASE_URL}/oauth2/token`,
      querystring.stringify(payload),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this.saveTokens(res.data);
  }

  private async refreshTokens(): Promise<void> {
    if (Date.now() - 60 * 1000 > this.expiration) {
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
        querystring.stringify(payload)
      );

      this.saveTokens(res.data);
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
        `${NetatmoApiClient.NETATMO_BASE_URL}/api/getstationsdata?get_favorites=${favorites}`,
        { headers: { Authorization: `Bearer ${this.accessToken}` } }
      );

      return DomainMapper.mapToDomain(res.data.body);
    } catch (e) {
      this.logger.error(e.message);
      this.logger.error('Response: ' + JSON.stringify(e.response.data, undefined, 2));
      return new Promise((resolve) => resolve(undefined));
    }
  }
}
