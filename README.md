# Netatmo API Client

This is a simple client for the Netatmo Weather API.

## Example usage

```ts
const netatmoClient = new NetatmoApiClient('<CLIENT_ID>', '<CLIENT_SECRET>');
await netatmoClient.login('<USERNAME>', '<PASSWORD>');
const stationData = netatmoClient.getStationData();
```
