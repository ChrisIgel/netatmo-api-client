export type MeasurementType =
  | 'temperature'
  | 'co2'
  | 'humidity'
  | 'pressure'
  | 'noise'
  | 'rain'
  | 'sum_rain'
  | 'windstrength'
  | 'windangle'
  | 'guststrength'
  | 'gustangle';

export type Measurement = { [type in MeasurementType]?: number | null };
export type Measurements = { [timestamp: string]: Measurement };
