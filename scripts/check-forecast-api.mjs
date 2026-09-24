const key = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
try {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Davao,PH&appid=${encodeURIComponent(key)}&units=metric`, { signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  console.log(JSON.stringify({ status: response.status, city: data.city?.name, intervals: data.list?.length }));
  if (!response.ok || !data.list?.length) process.exitCode = 1;
} catch {
  console.error('Forecast connection failed.');
  process.exitCode = 1;
}
