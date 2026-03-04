"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

function getTemperatureEmoji(temp: number): string {
  if (temp < 0) return "🥶";
  if (temp < 10) return "❄️";
  if (temp < 20) return "🌤️";
  if (temp < 30) return "☀️";
  return "🔥";
}

function WeatherCard({ data }: { data: any }) {
  const { location, lat, lon, maindetails } = data;
  const tempEmoji = getTemperatureEmoji(maindetails.temp);

  return (
    <div className="my-4 p-6 bg-gradient-to-r from-slate-500 to-slate-800 rounded-2xl shadow-2xl text-white max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold">{location}</h2>
          <p className="text-sm opacity-80">
            {lat.toFixed(2)}°, {lon.toFixed(2)}°
          </p>
        </div>
        <div className="text-6xl">{tempEmoji}</div>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="text-5xl font-bold mb-2">{maindetails.temp}°C</div>
        <div className="text-lg opacity-90">
          Feels like {maindetails.feels_like}°C
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="opacity-70">Min/Max</div>
          <div className="font-semibold">
            {maindetails.temp_min}° / {maindetails.temp_max}°C
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="opacity-70">Humidity</div>
          <div className="font-semibold">{maindetails.humidity}%</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="opacity-70">Pressure</div>
          <div className="font-semibold">{maindetails.pressure} hPa</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="opacity-70">Sea Level</div>
          <div className="font-semibold">{maindetails.sea_level} hPa</div>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              case "tool-weather":
                if (part.state === "output-available") {
                  return (
                    <WeatherCard
                      key={`${message.id}-${i}`}
                      data={part.output}
                    />
                  );
                }
              // return (
              //   <pre key={`${message.id}-${i}`}>
              //     {JSON.stringify(part, null, 2)}
              //   </pre>
              // );
            }
          })}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
