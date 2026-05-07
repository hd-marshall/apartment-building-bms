import { useState, useEffect } from 'react';

export interface WeatherData {
  temp: number;
  description: string;
  weatherCode: number;
}

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Showers', 81: 'Heavy showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail',
};

// Melbourne, Australia
const LAT = -37.81;
const LON = 144.96;

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const code: number = data.current.weather_code;
        setWeather({
          temp: parseFloat(data.current.temperature_2m.toFixed(1)),
          weatherCode: code,
          description: WMO_DESCRIPTIONS[code] ?? 'Unknown',
        });
      })
      .catch(() => setError(true));
  }, []);

  return { weather, error };
}
