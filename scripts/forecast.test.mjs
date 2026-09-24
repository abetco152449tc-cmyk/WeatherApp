import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

async function loadModule(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const { dailyForecast, fetchForecast } = await loadModule('../src/services/forecast.ts');
const { temperature, cityDate } = await loadModule('../src/utils/weather-format.ts');
const entry = (date, low, high) => ({
  dt: Date.parse(date) / 1000,
  main: { temp: high, temp_min: low, temp_max: high },
  weather: [{ main: 'Clouds', description: 'cloudy' }],
});
const sample = {
  city: { timezone: 8 * 3600 },
  list: [
    entry('2026-09-23T15:00:00Z', 25, 28),
    entry('2026-09-23T18:00:00Z', 23, 26),
    entry('2026-09-24T03:00:00Z', 27, 32),
  ],
};

await test('daily ranges use the searched city timezone across midnight', () => {
  const days = dailyForecast(sample);
  assert.equal(days.length, 2);
  assert.equal(days[0].date, '2026-09-23');
  assert.equal(days[1].date, '2026-09-24');
  assert.equal(days[1].low, 23);
  assert.equal(days[1].high, 32);
});

await test('unit conversion and unavailable values', () => {
  assert.equal(temperature(0, 'F'), '32°');
  assert.equal(temperature(31, 'C'), '31°');
  assert.equal(temperature(undefined, 'C'), '—');
  assert.equal(cityDate(sample.list[1].dt, sample.city.timezone).getUTCDate(), 24);
});

await test('forecast fetch validates responses and uses coordinates', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = 'test-key';
  const signal = new AbortController().signal;
  const weather = { coord: { lat: 7.07, lon: 125.6 } };

  try {
    globalThis.fetch = async url => {
      assert.equal(new URL(url).searchParams.get('lat'), '7.07');
      return Response.json(sample);
    };
    assert.deepEqual(await fetchForecast(weather, signal), sample);
    globalThis.fetch = async () => Response.json({ list: [], city: { timezone: 0 } });
    await assert.rejects(fetchForecast(weather, signal), /incomplete/);
    globalThis.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(fetchForecast(weather, signal), /unavailable/);
    globalThis.fetch = async () => { throw new Error('offline'); };
    await assert.rejects(fetchForecast(weather, signal), /connection/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
    else process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = originalKey;
  }
});
