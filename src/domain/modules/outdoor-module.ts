import { ReadsHumidity } from './capabilities/humidity';
import { ReadsTemperature } from './capabilities/temperature';
import { WirelessModule } from './wireless-module';

export interface OutdoorModule extends WirelessModule, ReadsTemperature, ReadsHumidity {}
