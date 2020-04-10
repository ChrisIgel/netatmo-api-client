import { MainModule } from './modules/main-module';
import { User } from './user';

export interface StationData {
  devices: MainModule[];
  user: User;
}
