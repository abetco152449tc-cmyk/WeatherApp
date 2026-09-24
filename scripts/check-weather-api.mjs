for (const city of ['Davao,PH', 'zzzzinvalidcityxyz']) {
  try {
    const key = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(key)}&units=metric`, { signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    console.log(JSON.stringify({ query: city, status: response.status, city: data.name, temperature: data.main?.temp, humidity: data.main?.humidity, message: data.message }));
    if (response.status !== (city === 'Davao,PH' ? 200 : 404)) process.exitCode = 1;
  } catch {
    console.error('Unable to reach OpenWeather.');
    process.exitCode = 1;
  }
}
