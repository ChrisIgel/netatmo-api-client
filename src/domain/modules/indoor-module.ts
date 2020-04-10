import { ReadsCO2 } from './capabilities/co2';
import { ReadsHumidity } from './capabilities/humidity';
import { ReadsTemperature } from './capabilities/temperature';
import { WirelessModule } from './wireless-module';

export interface IndoorModule extends WirelessModule, ReadsTemperature, ReadsCO2, ReadsHumidity {}
