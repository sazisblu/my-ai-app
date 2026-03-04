let meowlocation: string = "Kathmandu";
interface GeoData {
  name: string;
  local_names: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
}
interface 
const weather_api_key: string = "97dad85665e5bee9b97003a26261148c";
console.log(weather_api_key);
const weather: any = async ({ location }: { location: string }) => {
  //   const weather_api_key = process.env.weather_api_key;
  console.log("API Key:", weather_api_key);

  try {
    // Use the location name to get the geo coding
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${weather_api_key}`,
    );

    if (!geoResponse.ok) {
      throw new Error(
        `Failed to fetch geocoding data: ${geoResponse.statusText}`,
      );
    }

    const geoData: GeoData[] = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      throw new Error(`No geocoding data found for location: ${location}`);
    }

    const lat: number = geoData[0].lat;
    const lon: number = geoData[0].lon;

    console.log("Latitude:", lat, "Longitude:", lon);
    console.log("GeoData Response:", geoData);

    // Simulate temperature for now
    const temperature = Math.round(Math.random() * (90 - 32) + 32);
    return {
      location,
      temperature,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    return {
      location,
      errorText: error.message,
    };
  }
};

weather({ location: meowlocation }).then((result: any) => {
  console.log("Weather Result:", result);
});
