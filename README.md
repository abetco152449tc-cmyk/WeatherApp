# Weather App

An Expo / React Native weather app for the CCE106 API assessment.

## Run on a phone or emulator

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` if needed and set `EXPO_PUBLIC_OPENWEATHER_API_KEY` to your OpenWeather key. The existing local `.env` is already configured.
3. Run `npm start` (restart with `npx expo start --clear` after changing `.env`).
4. Open the QR code in an Expo Go version compatible with SDK 57, or press `a` for an installed Android emulator. Use `npm run web` for a browser preview.

The key is excluded from Git. Expo public environment variables are embedded in the client bundle; use a backend proxy for a production app requiring a private key.

## Code organization

- `src/app/index.tsx`: main screen layout.
- `src/styles/weather.styles.ts`: all weather screen styles, one property per line.
- `src/components/weather/CitySearch.tsx`: city input and search button.
- `src/components/weather/WeatherCard.tsx`: successful weather display.
- `src/components/weather/WeatherResult.tsx`: empty, loading, error and success views.
- `src/hooks/use-weather.ts`: form state, validation, search, retry and cancellation.
- `src/services/weather.ts`: API request and response validation.

## Grading criteria

| Requirement | Implementation |
| --- | --- |
| Working API request, fetch and async/await | `src/services/weather.ts`: OpenWeather current weather request |
| Dynamic query parameter | Encodes the submitted city in `q`; requests `units=metric` |
| useState and useEffect | `src/hooks/use-weather.ts`: form state and request effect with cancellation |
| Empty state | Welcome card before a search; inline validation for blank input |
| Loading state | Spinner and loading message during requests |
| Success state | City, temperature in Celsius, condition, humidity, feels-like and wind |
| Error state | Invalid city, connection failure, timeout, invalid key, rate limit and service failure |
| Meaningful interaction | Search button, keyboard submission, Davao shortcut and retry make requests |

## Demonstration checklist

- Launch the app and show the initial empty state.
- Submit a blank city to show validation.
- Search `Davao,PH`; show loading followed by real weather.
- Choose Search Another City, then search `Tokyo,JP`; explain that the query changes.
- Search `zzzzinvalidcityxyz` to show the invalid-city message.
- Disconnect the device from the internet and search again; show the network error (a stalled connection times out after 15 seconds).
- Reconnect, tap Try Again, and show successful recovery.

A device/emulator demonstration is still required for submission; automated checks do not replace it.

## Checks

- `npx tsc --noEmit`
- `npm run lint`
- `node scripts/weather.test.mjs` (Node 22+)
- `node --env-file=.env scripts/check-weather-api.mjs` (live valid/invalid-city checks)
- `npx expo export --platform web`

API reference: https://openweathermap.org/api/current
Expo SDK reference: https://docs.expo.dev/versions/v57.0.0/

## Mobile design and forecasts

The screen uses a bundled sky photograph, translucent cards, native safe areas, a keyboard-aware search bar, and horizontal forecast scrolling. The gear button opens a temperature-unit selector; Celsius/Fahrenheit applies to all temperature readings for the current session.

- `components/weather/ForecastSections.tsx`: independently loads forecasts and handles loading, retry and errors without hiding current weather.
- `components/weather/WeatherSettings.tsx`: temperature-unit settings modal.
- `services/forecast.ts`: OpenWeather five-day / three-hour forecast and daily grouping in the searched city's timezone.
- `utils/weather-format.ts`: temperature conversion, country names and weather symbols.

The 3-Hour Forecast displays the next eight available intervals. The five-day outlook summarizes available intervals by local calendar date; a partial first day is possible. Times use the searched city's timezone. The current weather card's date/time is the API observation time. No forecast values are hardcoded.

Additional checks: `node scripts/forecast.test.mjs` and `node --env-file=.env scripts/check-forecast-api.mjs`.
