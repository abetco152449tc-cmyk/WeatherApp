import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/services/weather.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { fetchWeather } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const sample = { name: 'Davao', sys: { country: 'PH' }, main: { temp: 31, humidity: 70, feels_like: 34 }, weather: [{ main: 'Clouds', description: 'cloudy' }], wind: { speed: 2 } };

await test('weather request and failure states', async t => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
  process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = 'test-key';
  try {
    await t.test('encodes the city dynamically and requests Celsius', async () => {
      globalThis.fetch = async url => {
        const parsed = new URL(url);
        assert.equal(parsed.searchParams.get('q'), 'Davao,PH & test');
        assert.equal(parsed.searchParams.get('units'), 'metric');
        return Response.json(sample);
      };
      assert.deepEqual(await fetchWeather('Davao,PH & test'), sample);
    });
    for (const [status, message] of [[404, /No city found/], [401, /API key/], [429, /Too many/], [503, /unavailable/]]) {
      await t.test(`handles HTTP ${status}`, async () => {
        globalThis.fetch = async () => new Response('', { status });
        await assert.rejects(fetchWeather('unknown'), message);
      });
    }
    await t.test('handles offline requests', async () => {
      globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
      await assert.rejects(fetchWeather('Davao'), /internet connection/);
    });
    await t.test('handles timeouts', async () => {
      const controller = new AbortController(); controller.abort();
      await assert.rejects(fetchWeather('Davao', controller.signal), /too long/);
    });
    await t.test('rejects incomplete data', async () => {
      globalThis.fetch = async () => Response.json({});
      await assert.rejects(fetchWeather('Davao'), /incomplete/);
    });
    await t.test('handles malformed JSON', async () => {
      globalThis.fetch = async () => new Response('not json');
      await assert.rejects(fetchWeather('Davao'), /unreadable/);
    });
    await t.test('explains missing configuration', async () => {
      delete process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
      await assert.rejects(fetchWeather('Davao'), /Add your OpenWeather API key/);
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
    else process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY = originalKey;
  }
});
