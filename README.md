# netatmo-api-client [![npm version](https://img.shields.io/npm/v/netatmo-api-client.svg?maxAge=2592000)](https://www.npmjs.com/package/netatmo-api-client) [![Downloads](https://img.shields.io/npm/dm/netatmo-api-client.svg?maxAge=2592000)](https://www.npmjs.com/package/netatmo-api-client)

This is a simple client for the Netatmo Weather API.

## Getting started

1. create an account on https://dev.netatmo.com
2. create an app (information can be arbitrary)
   1. use the client ID and client secret of the created app
3. request a token by using the token generator
   1. select scope `read_station`
   2. click `Generate Token`
   3. use the generated access and refresh tokens

![Generate Token](docs/generate_token.png)

## Example usage

```ts
const netatmoClient = new NetatmoApiClient('<CLIENT_ID>', '<CLIENT_SECRET>');

// set tokens acquire from the token generator
netatmoClient.setTokens('<ACCESS_TOKEN>', '<REFRESH_TOKEN>');

// use the client
const stationData = await netatmoClient.getStationData();
const { modules, ...mainStationData } = stationData.devices[0];
console.log(mainStationData);
console.log('User: ', stationData.user);

for (const station of stationData.devices) {
  console.log('='.repeat(80));
  console.log(`${station.stationName} [${station.id}] has ${station.modules.length} modules`);

  for (const module of [station, ...station.modules]) {
    console.log('-'.repeat(80));
    console.log(`${module.moduleName} [${module.id}] has these capabilities: ${module.capabilities}`);

    const measureCount = 2;
    const measures = await netatmoClient.getMeasure(station.id, module, undefined, undefined, '5min', measureCount);

    console.log(`Latest ${measureCount} measures:`);
    console.log(measures);
  }

  console.log('-'.repeat(80));
  console.log('='.repeat(80) + '\n');
}
```

The above example should print something like this:

```
{
  id: "aa:bb:cc:dd:ee:ff",
  type: "MAIN_MODULE",
  moduleName: "A",
  stationName: "B (A)",
  firmware: 204,
  reachable: true,
  lastSetup: 2014-12-24T15:14:51.000Z,
  dateSetup: 2014-12-24T15:14:51.000Z,
  lastStatusUpdate: 2024-11-05T00:05:15.000Z,
  lastUpgrade: 2015-08-20T19:06:50.000Z,
  wifiStatus: 25,
  co2Calibrating: false,
  place: {
    altitude: 250,
    city: "Example Town",
    country: "DE",
    timezone: "Europe/Berlin",
    longitude: 42.0000000,
    latitude: 42.0000000,
  },
  capabilities: [ "TEMPERATURE", "CO2", "HUMIDITY", "NOISE", "PRESSURE" ],
  measureTime: 2024-11-05T00:04:28.000Z,
  readOnly: undefined,
  temperature: {
    current: 23.1,
    min: 22.8,
    max: 23.4,
    dateMin: 2024-11-04T23:03:57.000Z,
    dateMax: 2024-11-04T23:39:16.000Z,
    trend: "STABLE",
  },
  co2: 769,
  humidity: 58,
  noise: 37,
  pressure: {
    current: 1019.4,
    absolute: 982.5,
    trend: "STABLE",
  },
}
User:  {
  mail: "example@mail.de",
  administrative: {
    country: "DE",
    locale: "de",
    regionalLocale: "de-DE",
    pressureUnit: "MBAR",
    systemOfMeasurement: "METRIC",
    windUnit: "KPH",
    feelLikeTemperatureAlgorithm: "HUMIDEX",
  },
}
================================================================================
Station Name [aa:bb:cc:dd:ee:ff] has 6 modules
--------------------------------------------------------------------------------
Module Name [aa:bb:cc:dd:ee:ff] has these capabilities: TEMPERATURE,CO2,HUMIDITY,NOISE,PRESSURE
Latest 2 measures:
{
  "1419433800": {
    temperature: 21.9,
    co2: null,
    humidity: 65,
    noise: null,
    pressure: 973,
  },
  "1419434400": {
    temperature: 22,
    co2: 0,
    humidity: 63,
    noise: 38,
    pressure: 972.9,
  },
}
--------------------------------------------------------------------------------
Module Name [aa:bb:cc:dd:ee:ff] has these capabilities: BATTERY,CO2,HUMIDITY,TEMPERATURE
Latest 2 measures:
{
  "1448400600": {
    co2: null,
    humidity: 47,
    temperature: 25.5,
  },
  "1448400900": {
    co2: 1344,
    humidity: 48,
    temperature: 25,
  },
}
--------------------------------------------------------------------------------
Module Name [aa:bb:cc:dd:ee:ff] has these capabilities: BATTERY,RAIN
Latest 2 measures:
{
  "1448402700": {
    rain: 0.273,
    sum_rain: 0.545308740978348,
  },
  "1448403000": {
    rain: 1.091,
    sum_rain: 1.090617481956696,
  },
}
--------------------------------------------------------------------------------
Module Name [aa:bb:cc:dd:ee:ff] has these capabilities: BATTERY,WIND
Latest 2 measures:
{
  "1605442800": {
    windstrength: 1,
    windangle: 147,
    guststrength: 2,
    gustangle: 90,
  },
  "1605443400": {
    windstrength: 2,
    windangle: 173,
    guststrength: 5,
    gustangle: 169,
  },
}
--------------------------------------------------------------------------------
Module Name [aa:bb:cc:dd:ee:ff] has these capabilities: BATTERY,HUMIDITY,TEMPERATURE
Latest 2 measures:
{
  "1668168000": {
    humidity: 95,
    temperature: 23.5,
  },
  "1668168300": {
    humidity: 86,
    temperature: 23.9,
  },
}
--------------------------------------------------------------------------------
================================================================================
```
