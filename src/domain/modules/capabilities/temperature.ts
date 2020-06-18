import { Trend } from './trend.enum';

export interface ReadsTemperature {
  temperature?: TemperatureData;
}

export interface TemperatureData {
  current: number;
  min: number;
  max: number;
  dateMin: Date;
  dateMax: Date;
  trend: Trend;
}
