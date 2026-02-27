import React, { useEffect, useState } from 'react';
import { Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import axios from 'axios';

const WeatherWidget = () => {
    // Mock Data for Reliability
    const weatherData = {
        temp: 28,
        humidity: 65,
        wind: 12,
        desc: 'Partly Cloudy'
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Local Weather</h4>
                <div className="flex items-center gap-2">
                     <span className="text-2xl font-bold text-gray-800">{weatherData.temp}°C</span>
                     <span className="text-sm text-gray-500">{weatherData.desc}</span>
                </div>
            </div>
            <div className="text-right text-xs text-gray-400">
                <div className="flex items-center gap-1 justify-end"><Droplets size={12}/> {weatherData.humidity}% Humidity</div>
                <div className="flex items-center gap-1 justify-end"><Wind size={12}/> {weatherData.wind} km/h</div>
            </div>
            <div className="text-yellow-500 bg-yellow-50 p-2 rounded-full">
                <Sun size={24} />
            </div>
        </div>
    );
};

export default WeatherWidget;
