"use client";
import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, Loader2 } from "lucide-react";

interface WeatherWidgetProps {
    apiKey?: string;
    targetLocation?: string;
}

export function WeatherWidget({ apiKey, targetLocation }: WeatherWidgetProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!apiKey || !targetLocation) {
            setLoading(false);
            return;
        }

        const fetchWeather = async () => {
            try {
                // Determine if location is a 5 digit US zip code
                const isZip = /^\d{5}$/.test(targetLocation.trim());
                const queryParam = isZip ? `zip=${targetLocation.trim()},us` : `q=${targetLocation.trim()}`;

                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?${queryParam}&appid=${apiKey}&units=imperial`);
                const data = await res.json();

                if (data.cod === 200) {
                    setWeather(data);
                }
            } catch (e) {
                console.error("Failed to fetch weather", e);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        // Refresh every 30 mins
        const timer = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(timer);
    }, [apiKey, targetLocation]);

    if (loading) return <div className="text-white opacity-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"><Loader2 className="animate-spin" /></div>;
    if (!weather) return null;

    const condition = weather.weather[0]?.main?.toLowerCase();

    const Icon = () => {
        if (condition === "clear") return <Sun size={56} className="text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />;
        if (condition === "rain" || condition === "drizzle") return <CloudRain size={56} className="text-blue-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />;
        if (condition === "snow") return <Snowflake size={56} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />;
        if (condition === "thunderstorm") return <CloudLightning size={56} className="text-indigo-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />;
        return <Cloud size={56} className="text-gray-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />;
    };

    return (
        <div className="flex flex-col items-center justify-center text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] bg-black/20 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/10">
            <Icon />
            <div className="text-5xl md:text-6xl font-bold mt-4 tracking-tighter">
                {Math.round(weather.main?.temp)}&deg;
            </div>
            <div className="text-base md:text-lg font-medium opacity-90 mt-1 capitalize text-center leading-tight max-w-[140px]">
                {weather.weather[0]?.description}
            </div>
        </div>
    );
}
