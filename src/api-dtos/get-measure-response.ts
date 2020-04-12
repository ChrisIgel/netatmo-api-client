export interface GetMeasureResponse {
  body: MeasureDataDto;
  status: string;
  time_exec: number;
  time_server: number;
}

export interface MeasureDataDto {
  [timestamp: string]: number[];
}
