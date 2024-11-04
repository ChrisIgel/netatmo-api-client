import { Trend } from './trend.enum';

export interface ReadsPressure {
  pressure?: PressureData;
}

export interface PressureData {
  current: number;
  absolute: number;
  trend: Trend;
}
