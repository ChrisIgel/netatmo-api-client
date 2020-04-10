export interface ReadsWind {
  wind: WindData;
}

export interface WindData {
  windStrength: number;
  windAngle: number;
  gustStrength: number;
  gustAngle: number;
  maxWindStrength: number;
  maxWindAngle: number;
  dateMaxWindStrength: Date;
}
