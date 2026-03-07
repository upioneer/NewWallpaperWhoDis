"use client";

import { KioskWidget } from "@/lib/db";
import { ClockWidget } from "./ClockWidget";
import { WeatherWidget } from "./WeatherWidget";
import { LocationWidget } from "./LocationWidget";
import { TextWidget } from "./TextWidget";

interface WidgetGridProps {
    widgets: KioskWidget[];
    weatherApiKey?: string;
    targetLocation?: string;
}

export function WidgetGrid({ widgets, weatherApiKey, targetLocation }: WidgetGridProps) {
    if (!widgets || widgets.length === 0) return null;

    return (
        <div className="absolute inset-0 z-50 pointer-events-none p-12 lg:p-16">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(position => {
                    const widget = widgets.find(w => w.position === position && w.enabled);

                    // Determine alignment classes based on position
                    let justifyClass = "justify-start text-left";
                    if (position % 3 === 2) justifyClass = "justify-center text-center";
                    if (position % 3 === 0) justifyClass = "justify-end text-right";

                    let alignClass = "items-start";
                    if (position > 3 && position <= 6) alignClass = "items-center";
                    if (position > 6) alignClass = "items-end";

                    return (
                        <div key={position} className={`flex ${justifyClass} ${alignClass}`}>
                            {widget && (
                                <div className="pointer-events-auto animate-in fade-in zoom-in-95 duration-1000 fill-mode-both" style={{ animationDelay: `${position * 100}ms` }}>
                                    {widget.type === "clock" && <ClockWidget />}
                                    {widget.type === "weather" && <WeatherWidget apiKey={weatherApiKey} targetLocation={targetLocation} />}
                                    {widget.type === "location" && <LocationWidget targetLocation={targetLocation} />}
                                    {widget.type === "text" && <TextWidget text={widget.textValue} />}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
