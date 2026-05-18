export async function getUserLocation(lang = 'en'): Promise<{lat: number, lon: number, city?: string}> {
  const acceptLang = lang === 'ru' ? 'ru,en' : 'en';

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Geolocation timeout")), 5000)
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
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${acceptLang}`
          );
          if (!res.ok) throw new Error("Reverse geocode failed");
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Current Location";
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

  return Promise.race([geoPromise, timeoutPromise]);
}

export async function searchCity(
  query: string,
  lang = 'en'
): Promise<Array<{ name: string; lat: number; lon: number; country: string }>> {
  if (!query || query.length < 2) return [];
  const acceptLang = lang === 'ru' ? 'ru,en' : 'en';
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&accept-language=${acceptLang}`
  );
  if (!res.ok) throw new Error("City search failed");
  const data = await res.json();
  return data.map((item: {
    name: string;
    lat: string;
    lon: string;
    address?: { country?: string; city?: string; town?: string; village?: string; county?: string };
  }) => ({
    name:
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.county ||
      item.name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    country: item.address?.country || "",
  }));
}
