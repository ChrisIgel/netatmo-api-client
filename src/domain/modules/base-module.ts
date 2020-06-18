import { Capability } from './capabilities/capability.enum';

export interface BaseModule {
  id: string;
  type?: ModuleType;
  capabilities: Capability[];
  moduleName: string;
  firmware: number;
  reachable: boolean;
  lastSetup: Date;
  measureTime?: Date;
}

export enum ModuleType {
  MAIN_MODULE = 'MAIN_MODULE',
  RAIN_MODULE = 'RAIN_MODULE',
  WIND_MODULE = 'WIND_MODULE',
  OUTDOOR_MODULE = 'OUTDOOR_MODULE',
  INDOOR_MODULE = 'INDOOR_MODULE',
}
