export interface GetStationDataResponse {
  body: StationDataDto;
  status: string;
  time_exec: number;
  time_server: number;
}

export interface StationDataDto {
  devices: DeviceDto[];
  user: UserDto;
}

interface BaseDeviceDto {
  _id: string;
  type: string;
  module_name: string;
  data_type: string[];
  firmware: number;
  dashboard_data?: DashboardDto;
  reachable: boolean;
  last_setup: number;
}

export interface DeviceDto extends BaseDeviceDto {
  date_setup: number;
  last_status_store: number;
  last_upgrade: number;
  wifi_status: number;
  co2_calibrating: boolean;
  station_name: string;
  place: PlaceDto;
  read_only?: boolean;
  modules: ModuleDto[];
}

export interface ModuleDto extends BaseDeviceDto {
  last_message: number;
  last_seen: number;
  rf_status: number;
  battery_vp: number;
  battery_percent: number;
}

interface PlaceDto {
  timezone: string;
  city: string;
  country: string;
  altitude: number;
  location: number[];
}

interface UserDto {
  mail: string;
  administrative: AdministrativeDto;
}

export interface AdministrativeDto {
  country: string;
  feel_like_algo: number;
  lang: string;
  pressureunit: number;
  reg_locale: string;
  unit: number;
  windunit: number;
}

export interface DashboardDto {
  time_utc: number;
  Temperature: number;
  CO2: number;
  Humidity: number;
  Noise: number;
  Pressure: number;
  AbsolutePressure: number;
  min_temp: number;
  max_temp: number;
  date_min_temp: number;
  date_max_temp: number;
  temp_trend: string;
  pressure_trend: string;
  Rain: number;
  sum_rain_24: number;
  sum_rain_1: number;
  WindStrength: number;
  WindAngle: number;
  GustStrength: number;
  GustAngle: number;
  max_wind_str: number;
  max_wind_angle: number;
  date_max_wind_str: number;
}
