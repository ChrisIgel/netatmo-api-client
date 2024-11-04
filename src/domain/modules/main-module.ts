import { Place } from '../place';
import { BaseModule } from './base-module';
import { ReadsCO2 } from './capabilities/co2';
import { ReadsHumidity } from './capabilities/humidity';
import { ReadsNoise } from './capabilities/noise';
import { ReadsPressure } from './capabilities/pressure';
import { ReadsTemperature } from './capabilities/temperature';

export interface MainModule extends BaseModule, ReadsTemperature, ReadsCO2, ReadsHumidity, ReadsNoise, ReadsPressure {
  stationName: string;
  firmware: number;
  reachable: boolean;
  lastSetup: Date;
  dateSetup: Date;
  lastStatusUpdate: Date;
  lastUpgrade: Date;
  /** value between 0 (bad) and 30 (good) */
  wifiStatus: number;
  co2Calibrating: boolean;
  place: Place;
  readOnly?: boolean;
  measureTime?: Date;
  modules: BaseModule[];
}
