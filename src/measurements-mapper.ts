import { MeasureDataDto } from './api-dtos/get-measure-response';
import { Measurements, MeasurementType } from './domain/measurements';
import { Capability } from './domain/modules/capabilities/capability.enum';

export class MeasurementsMapper {
  public static dtoToDomain(measureDataDto: MeasureDataDto, capabilities: Capability[]): Measurements {
    const result: Measurements = {};
    const types = MeasurementsMapper.mapCapabilitiesToType(...capabilities);

    Object.entries(measureDataDto).forEach(([timestamp, values]) => {
      result[timestamp] = {};
      for (let i = 0; i < types.length; i++) {
        result[timestamp][types[i]] = values[i];
      }
    });

    return result;
  }

  public static mapCapabilitiesToType(...capabilities: Capability[]): MeasurementType[] {
    const types = capabilities.map((c) => {
      switch (c) {
        case Capability.TEMPERATURE:
          return ['temperature'] as MeasurementType[];
        case Capability.CO2:
          return ['co2'] as MeasurementType[];
        case Capability.HUMIDITY:
          return ['humidity'] as MeasurementType[];
        case Capability.PRESSURE:
          return ['pressure'] as MeasurementType[];
        case Capability.NOISE:
          return ['noise'] as MeasurementType[];
        case Capability.RAIN:
          return ['rain', 'sum_rain'] as MeasurementType[];
        case Capability.WIND:
          return ['windstrength', 'windangle', 'guststrength', 'gustangle'] as MeasurementType[];
        default:
          return [];
      }
    });

    return types.flat();
  }
}
