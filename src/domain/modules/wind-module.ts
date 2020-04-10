import { ReadsWind } from './capabilities/wind';
import { WirelessModule } from './wireless-module';

export interface WindModule extends WirelessModule, ReadsWind {}
