export interface ReadsRain {
  rain: RainData;
}

export interface RainData {
  current: number;
  lastHour: number;
  last24Hours: number;
}
