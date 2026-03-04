"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { logout } from "./actions";

function LogoutButtonContent() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-red-600 text-white font-semibold text-sm rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Logging out..." : "Logout"}
    </button>
  );
}

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
    <div className="my-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-black">{location}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {lat.toFixed(2)}°, {lon.toFixed(2)}°
          </p>
        </div>
        <div className="text-5xl">{tempEmoji}</div>
      </div>

      <div className="border-l-4 border-black pl-4 mb-6">
        <div className="text-5xl font-bold text-black mb-2">
          {maindetails.temp}°C
        </div>
        <div className="text-sm text-gray-700">
          Feels like {maindetails.feels_like}°C
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded p-4">
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
            Min/Max
          </div>
          <div className="text-lg font-semibold text-black">
            {maindetails.temp_min}° / {maindetails.temp_max}°
          </div>
        </div>
        <div className="border border-gray-200 rounded p-4">
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
            Humidity
          </div>
          <div className="text-lg font-semibold text-black">
            {maindetails.humidity}%
          </div>
        </div>
        <div className="border border-gray-200 rounded p-4">
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
            Pressure
          </div>
          <div className="text-lg font-semibold text-black">
            {maindetails.pressure} hPa
          </div>
        </div>
        <div className="border border-gray-200 rounded p-4">
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
            Sea Level
          </div>
          <div className="text-lg font-semibold text-black">
            {maindetails.sea_level} hPa
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();
  return (
    <div className="flex flex-col w-screen h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-6 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Saz-AI-App</h1>
            <p className="text-gray-600 text-sm mt-1">
              Ask about weather conditions in any location
            </p>
          </div>
          <form action={logout}>
            <LogoutButtonContent />
          </form>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 mb-24">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-lg ${message.role === "user" ? "" : ""}`}>
                {message.role === "assistant" && (
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Assistant
                  </p>
                )}
                <div
                  className={`px-4 py-3 rounded-lg ${message.role === "user" ? "bg-black text-white rounded-br-none" : "bg-gray-100 text-black rounded-bl-none"}`}
                >
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="whitespace-pre-wrap text-sm leading-relaxed"
                          >
                            {part.text}
                          </div>
                        );
                      case "tool-weather":
                        if (part.state === "output-available") {
                          return (
                            <WeatherCard
                              key={`${message.id}-${i}`}
                              data={part.output}
                            />
                          );
                        }
                    }
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
        }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 w-screen"
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500 text-sm"
            value={input}
            placeholder="Ask about weather in any city..."
            onChange={(e) => setInput(e.currentTarget.value)}
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-black text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
