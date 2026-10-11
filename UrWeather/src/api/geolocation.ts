import { requestJson } from './request';

interface GeocodeResult {
  name?: string;
  display_name?: string;
  lat: string;
  lon: string;
  address?: { country?: string; city?: string; town?: string; village?: string; county?: string };
}

function cityName(item: GeocodeResult | null) {
  const names = [item?.address?.city, item?.address?.town, item?.address?.village,
    item?.address?.county, item?.name, typeof item?.display_name === 'string' ? item.display_name.split(',')[0] : ''];
  return names.find(name => typeof name === 'string' && name.trim()) || '';
}

export async function reverseCity(lat: number, lon: number, lang = 'en'): Promise<string> {
  const acceptLang = lang === 'ru' ? 'ru,en' : 'en';
  const data = await requestJson(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${acceptLang}`
  ) as GeocodeResult | null;
  return cityName(data) || 'My Location';
}

export async function getUserLocation(lang = 'en'): Promise<{lat: number, lon: number, city?: string}> {
  let timer: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) =>
    { timer = setTimeout(() => reject(new Error("Geolocation timeout")), 5000); }
  );

  const geoPromise = new Promise<{lat: number, lon: number, city?: string}>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        try {
          const city = await reverseCity(lat, lon, lang);
          resolve({ lat, lon, city });
        } catch {
          resolve({ lat, lon, city: "Current Location" });
        }
      },
      (error) => {
        reject(error);
      },
      { timeout: 4000, maximumAge: 60000 }
    );
  });

  return Promise.race([geoPromise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export async function searchCity(
  query: string,
  lang = 'en'
): Promise<Array<{ name: string; lat: number; lon: number; country: string }>> {
  query = query.trim();
  if (query.length < 2) return [];
  const acceptLang = lang === 'ru' ? 'ru,en' : 'en';
  const data = await requestJson(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&accept-language=${acceptLang}`
  );
  if (!Array.isArray(data)) throw new Error('City search returned an invalid response');
  return data.filter((item): item is GeocodeResult => item && typeof item === 'object').map(item => ({
    name: cityName(item),
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    country: typeof item.address?.country === 'string' ? item.address.country : '',
  })).filter(item => item.name && Number.isFinite(item.lat) && Number.isFinite(item.lon)
    && Math.abs(item.lat) <= 90 && Math.abs(item.lon) <= 180);
}
