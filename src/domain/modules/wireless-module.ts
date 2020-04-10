import { BaseModule } from './base-module';
import { IsWireless } from './capabilities/wireless';

export interface WirelessModule extends BaseModule, IsWireless {}
