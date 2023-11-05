# Netatmo API Client

This is a simple client for the Netatmo Weather API.

## Example usage

```ts
const netatmoClient = new NetatmoApiClient('<CLIENT_ID>', '<CLIENT_SECRET>');

// login with (will not work after october 2023)
await netatmoClient.login('<USERNAME>', '<PASSWORD>');
// or
netatmoClient.setTokens('<ACCESS_TOKEN>', '<REFRESH_TOKEN>');

// use the client
const stationData = netatmoClient.getStationData();
```
