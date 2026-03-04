import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";
import { record, string, z } from "zod";

interface GeoData {
  name: string;
  local_names: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
}

interface Coord {
  lon: number;
  lat: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level: number;
  grnd_level: number;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

interface Clouds {
  all: number;
}

interface Sys {
  country: string;
  sunrise: number;
  sunset: number;
}

interface WeatherData {
  coord: Coord;
  weather: Weather[];
  base: string;
  main: Main;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  let setpcounter = 0;
  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async ({ location }) => {
          const weather_api_key = process.env.weather_api_key;
          //  use the location name to get the geo coding (lat and long)
          const geoResponse = await fetch(
            `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${weather_api_key}`,
          );

          const geoData: GeoData[] = await geoResponse.json();
          let lat: number = geoData[0].lat;
          let lon: number = geoData[0].lon;
          // console.log(geoData);
          //  using this api to get the weather details of the location specified by lat and long
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weather_api_key}&units=metric`,
          );
          // parsing the response object into json
          const weatherdata: WeatherData = await weatherResponse.json();
          console.log(`temperature of ${location}:`, weatherdata.main.temp);
          //extracting the temperature field from the json
          const maindetails = weatherdata.main;
          // const temperature = weatherdata.main.temp;
          return {
            location,
            lat,
            lon,
            maindetails,
          };
        },
      }),
    },
    onStepFinish: ({ toolResults }) => {
      setpcounter++;
      console.log(
        `Step ${setpcounter}:`,
        toolResults.length > 0 ? toolResults : "No Tool results generated",
      );
      // console.log(toolResults);
    },
  });

  return result.toUIMessageStreamResponse();
}
