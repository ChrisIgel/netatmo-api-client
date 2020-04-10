import { ReadsRain } from './capabilities/rain';
import { WirelessModule } from './wireless-module';

export interface RainModule extends WirelessModule, ReadsRain {}
