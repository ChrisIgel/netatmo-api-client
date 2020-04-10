export interface Administrative {
  regionalLocale: string;
  locale: string;
  country: string;
  systemOfMeasurement: SystemOfMeasurement;
  windUnit: WindUnit;
  pressureUnit: PressureUnit;
  feelLikeTemperatureAlgorithm: FeelLikeTemperatureAlgorithm;
}

export enum SystemOfMeasurement {
  METRIC = 'METRIC',
  IMPERIAL = 'IMPERIAl',
}

export enum WindUnit {
  KPH = 'KPH',
  MPH = 'MPH',
  MS = 'MS',
  BEAUFORT = 'BEAUFORT',
  KNOT = 'KNOT',
}

export enum PressureUnit {
  MBAR = 'MBAR',
  INHG = 'INHG',
  MMHG = 'MMHG',
}

export enum FeelLikeTemperatureAlgorithm {
  HUMIDEX = 'HUMIDEX',
  HEAT_INDEX = 'HEAT_INDEX',
}
