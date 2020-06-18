import {
  AdministrativeDto,
  DashboardDto,
  DeviceDto,
  ModuleDto,
  StationDataDto,
} from './api-dtos/get-station-data-response';
import {
  Administrative,
  FeelLikeTemperatureAlgorithm,
  PressureUnit,
  SystemOfMeasurement,
  WindUnit,
} from './domain/administrative';
import { ModuleType } from './domain/modules/base-module';
import { Capability } from './domain/modules/capabilities/capability.enum';
import { PressureData } from './domain/modules/capabilities/pressure';
import { RainData } from './domain/modules/capabilities/rain';
import { TemperatureData } from './domain/modules/capabilities/temperature';
import { Trend } from './domain/modules/capabilities/trend.enum';
import { WindData } from './domain/modules/capabilities/wind';
import { IndoorModule } from './domain/modules/indoor-module';
import { MainModule } from './domain/modules/main-module';
import { OutdoorModule } from './domain/modules/outdoor-module';
import { RainModule } from './domain/modules/rain-module';
import { WindModule } from './domain/modules/wind-module';
import { WirelessModule } from './domain/modules/wireless-module';
import { StationData } from './domain/station-data';
import { User } from './domain/user';

export class StationDataMapper {
  public static dtoToDomain(stationDataDto: StationDataDto): StationData {
    const user: User = {
      mail: stationDataDto.user.mail,
      administrative: StationDataMapper.mapAdministrative(stationDataDto.user.administrative),
    };

    const devices: MainModule[] = stationDataDto.devices.map(StationDataMapper.mapDeviceDtoToMainModule);

    return { devices, user };
  }

  private static mapDeviceDtoToMainModule(dto: DeviceDto): MainModule {
    return {
      id: dto._id,
      type: ModuleType.MAIN_MODULE,
      moduleName: dto.module_name,
      stationName: dto.station_name,
      firmware: dto.firmware,
      reachable: dto.reachable,
      lastSetup: new Date(dto.last_setup * 1000),
      dateSetup: new Date(dto.date_setup * 1000),
      lastStatusUpdate: new Date(dto.last_status_store * 1000),
      lastUpgrade: new Date(dto.last_upgrade * 1000),
      wifiStatus: 30 - (dto.wifi_status - 56),
      co2Calibrating: dto.co2_calibrating,
      place: {
        altitude: dto.place.altitude,
        city: dto.place.city,
        country: dto.place.country,
        timezone: dto.place.timezone,
        longitude: dto.place.location[0],
        latitude: dto.place.location[1],
      },
      capabilities: [
        Capability.TEMPERATURE,
        Capability.CO2,
        Capability.HUMIDITY,
        Capability.NOISE,
        Capability.PRESSURE,
      ],
      measureTime: new Date(dto.dashboard_data.time_utc * 1000),
      readOnly: dto.read_only,
      temperature: StationDataMapper.mapTemperature(dto.dashboard_data),
      co2: dto.dashboard_data.CO2,
      humidity: dto.dashboard_data.Humidity,
      noise: dto.dashboard_data.Noise,
      pressure: StationDataMapper.mapPressure(dto.dashboard_data),
      modules: dto.modules.map(StationDataMapper.mapModule).filter((m) => m !== null) as WirelessModule[],
    };
  }

  private static mapModule(dto: ModuleDto): WirelessModule | null {
    switch (dto.type) {
      case 'NAModule1':
        return StationDataMapper.mapOutdoorModule(dto);
      case 'NAModule2':
        return StationDataMapper.mapWindModule(dto);
      case 'NAModule3':
        return StationDataMapper.mapRainModule(dto);
      case 'NAModule4':
        return StationDataMapper.mapIndoorModule(dto);
      default:
        return null;
    }
  }

  private static mapWirelessModule(dto: ModuleDto): WirelessModule {
    return {
      id: dto._id,
      capabilities: [Capability.BATTERY],
      moduleName: dto.module_name,
      firmware: dto.firmware,
      reachable: dto.reachable,
      lastSetup: new Date(dto.last_setup * 1000),
      measureTime: dto.dashboard_data ? new Date(dto.dashboard_data.time_utc * 1000) : undefined,
      batteryPercent: dto.battery_percent,
      batteryVp: dto.battery_vp,
      lastSeen: new Date(dto.last_seen * 1000),
      rfStatus: 30 - (dto.rf_status - 60),
    };
  }

  private static mapOutdoorModule(dto: ModuleDto): OutdoorModule {
    const module: OutdoorModule = {
      ...StationDataMapper.mapWirelessModule(dto),
      type: ModuleType.OUTDOOR_MODULE,
      humidity: dto.dashboard_data ? dto.dashboard_data.Humidity : undefined,
      temperature: StationDataMapper.mapTemperature(dto.dashboard_data),
    };

    module.capabilities.push(Capability.HUMIDITY, Capability.TEMPERATURE);

    return module;
  }

  private static mapWindModule(dto: ModuleDto): WindModule {
    const module: WindModule = {
      ...StationDataMapper.mapWirelessModule(dto),
      type: ModuleType.WIND_MODULE,
      wind: StationDataMapper.mapWind(dto.dashboard_data),
    };

    module.capabilities.push(Capability.WIND);

    return module;
  }

  private static mapRainModule(dto: ModuleDto): RainModule {
    const module: RainModule = {
      ...StationDataMapper.mapWirelessModule(dto),
      type: ModuleType.RAIN_MODULE,
      rain: StationDataMapper.mapRain(dto.dashboard_data),
    };

    module.capabilities.push(Capability.RAIN);

    return module;
  }

  private static mapIndoorModule(dto: ModuleDto): IndoorModule {
    const module: IndoorModule = {
      ...StationDataMapper.mapWirelessModule(dto),
      type: ModuleType.INDOOR_MODULE,
      co2: dto.dashboard_data ? dto.dashboard_data.CO2 : undefined,
      humidity: dto.dashboard_data ? dto.dashboard_data.Humidity : undefined,
      temperature: StationDataMapper.mapTemperature(dto.dashboard_data),
    };

    module.capabilities.push(Capability.CO2, Capability.HUMIDITY, Capability.TEMPERATURE);

    return module;
  }

  private static mapTemperature(data: DashboardDto): TemperatureData | undefined {
    if (data) {
      return {
        current: data.Temperature,
        min: data.min_temp,
        max: data.max_temp,
        dateMin: new Date(data.date_min_temp * 1000),
        dateMax: new Date(data.date_max_temp * 1000),
        trend: StationDataMapper.mapTrend(data.temp_trend),
      };
    }

    return undefined;
  }

  private static mapWind(data: DashboardDto): WindData | undefined {
    if (data) {
      return {
        windStrength: data.WindStrength,
        windAngle: data.WindAngle,
        gustStrength: data.GustStrength,
        gustAngle: data.GustAngle,
        maxWindStrength: data.max_wind_str,
        maxWindAngle: data.max_wind_angle,
        dateMaxWindStrength: new Date(data.date_max_wind_str * 1000),
      };
    }

    return undefined;
  }

  private static mapRain(data: DashboardDto): RainData | undefined {
    if (data) {
      return {
        current: data.Rain,
        lastHour: data.sum_rain_1,
        last24Hours: data.sum_rain_24,
      };
    }

    return undefined;
  }

  private static mapPressure(data: DashboardDto): PressureData {
    return {
      current: data.Pressure,
      absolute: data.AbsolutePressure,
      trend: StationDataMapper.mapTrend(data.pressure_trend),
    };
  }

  private static mapAdministrative(dto: AdministrativeDto): Administrative {
    return {
      country: dto.country,
      locale: dto.lang,
      regionalLocale: dto.reg_locale,
      pressureUnit: StationDataMapper.mapPressureUnit(dto.pressureunit),
      systemOfMeasurement: StationDataMapper.mapSystemOfMeasurement(dto.unit),
      windUnit: StationDataMapper.mapWindUnit(dto.windunit),
      feelLikeTemperatureAlgorithm: StationDataMapper.mapFeelLikeTemperatureAlgorithm(dto.feel_like_algo),
    };
  }

  private static mapPressureUnit(unit: number): PressureUnit {
    switch (unit) {
      case 0:
        return PressureUnit.MBAR;
      case 1:
        return PressureUnit.INHG;
      case 2:
        return PressureUnit.MMHG;
      default:
        return PressureUnit.MBAR;
    }
  }

  private static mapSystemOfMeasurement(system: number): SystemOfMeasurement {
    switch (system) {
      case 0:
        return SystemOfMeasurement.METRIC;
      case 1:
        return SystemOfMeasurement.IMPERIAL;
      default:
        return SystemOfMeasurement.METRIC;
    }
  }

  private static mapWindUnit(unit: number): WindUnit {
    switch (unit) {
      case 0:
        return WindUnit.KPH;
      case 1:
        return WindUnit.MPH;
      case 2:
        return WindUnit.MS;
      case 3:
        return WindUnit.BEAUFORT;
      case 4:
        return WindUnit.KNOT;
      default:
        return WindUnit.KPH;
    }
  }

  private static mapFeelLikeTemperatureAlgorithm(algorithm: number): FeelLikeTemperatureAlgorithm {
    switch (algorithm) {
      case 0:
        return FeelLikeTemperatureAlgorithm.HUMIDEX;
      case 1:
        return FeelLikeTemperatureAlgorithm.HEAT_INDEX;
      default:
        return FeelLikeTemperatureAlgorithm.HUMIDEX;
    }
  }

  private static mapTrend(trend: string): Trend {
    switch (trend) {
      case 'up':
        return Trend.UP;
      case 'down':
        return Trend.DOWN;
      case 'stable':
        return Trend.STABLE;
      default:
        return Trend.STABLE;
    }
  }
}
