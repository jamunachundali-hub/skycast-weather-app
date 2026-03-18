const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

const WMO_CODES = {
    0: { desc: "Clear sky", icon: "☀️", bg: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)" },
    1: { desc: "Mainly clear", icon: "🌤️", bg: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)" },
    2: { desc: "Partly cloudy", icon: "⛅", bg: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)" },
    3: { desc: "Overcast", icon: "☁️", bg: "linear-gradient(135deg, #475569 0%, #64748b 100%)" },
    45: { desc: "Fog", icon: "🌫️", bg: "linear-gradient(135deg, #334155 0%, #475569 100%)" },
    48: { desc: "Depositing rime fog", icon: "🌫️", bg: "linear-gradient(135deg, #334155 0%, #475569 100%)" },
    51: { desc: "Drizzle: Light intensity", icon: "🌦️", bg: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)" },
    53: { desc: "Drizzle: Moderate intensity", icon: "🌦️", bg: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)" },
    55: { desc: "Drizzle: Dense intensity", icon: "🌦️", bg: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)" },
    61: { desc: "Rain: Slight", icon: "🌧️", bg: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" },
    63: { desc: "Rain: Moderate", icon: "🌧️", bg: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)" },
    65: { desc: "Rain: Heavy", icon: "🌧️", bg: "linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)" },
    66: { desc: "Freezing Rain: Light", icon: "🧊", bg: "linear-gradient(135deg, #475569 0%, #94a3b8 100%)" },
    67: { desc: "Freezing Rain: Heavy", icon: "🧊", bg: "linear-gradient(135deg, #1e293b 0%, #475569 100%)" },
    71: { desc: "Snow fall: Slight", icon: "❄️", bg: "linear-gradient(135deg, #cbd5e1 0%, #f1f5f9 100%)" },
    73: { desc: "Snow fall: Moderate", icon: "❄️", bg: "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)" },
    75: { desc: "Snow fall: Heavy", icon: "❄️", bg: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)" },
    77: { desc: "Snow grains", icon: "❄️", bg: "linear-gradient(135deg, #cbd5e1 0%, #f1f5f9 100%)" },
    80: { desc: "Rain showers: Slight", icon: "🌦️", bg: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)" },
    81: { desc: "Rain showers: Moderate", icon: "🌦️", bg: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)" },
    82: { desc: "Rain showers: Violent", icon: "🌦️", bg: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)" },
    85: { desc: "Snow showers: Slight", icon: "🌨️", bg: "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)" },
    86: { desc: "Snow showers: Heavy", icon: "🌨️", bg: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)" },
    95: { desc: "Thunderstorm: Slight", icon: "⛈️", bg: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)" },
    96: { desc: "Thunderstorm with hail", icon: "⛈️", bg: "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)" },
    99: { desc: "Thunderstorm with heavy hail", icon: "⛈️", bg: "linear-gradient(135deg, #170a2c 0%, #2e1065 100%)" },
};

// Initialize Lucide
window.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) window.lucide.createIcons();
});

const UI = {
    input: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    weatherContent: document.getElementById('weather-content'),
    loader: document.getElementById('loader'),
    welcome: document.getElementById('welcome-message'),
    error: document.getElementById('error-message'),
    cityName: document.getElementById('city-name'),
    countryName: document.getElementById('country-name'),
    currentDate: document.getElementById('current-date'),
    temperature: document.getElementById('temperature'),
    weatherDesc: document.getElementById('weather-desc'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    visibility: document.getElementById('visibility'),
    forecastGrid: document.getElementById('forecast-grid'),
    bgContainer: document.getElementById('background-container')
};

UI.searchBtn.addEventListener('click', () => {
    const city = UI.input.value.trim();
    if (city) searchCity(city);
});

UI.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = UI.input.value.trim();
        if (city) searchCity(city);
    }
});

async function searchCity(city) {
    showLoading();
    try {
        const geoRes = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            showError();
            return;
        }

        const location = geoData.results[0];
        const weatherRes = await fetch(`${WEATHER_API_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        const weatherData = await weatherRes.json();

        updateUI(location, weatherData);
    } catch (err) {
        console.error(err);
        showError();
    }
}

function updateUI(location, weather) {
    const current = weather.current;
    const daily = weather.daily;
    const weatherInfo = WMO_CODES[current.weather_code] || { desc: "Unknown", icon: "❓", bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" };

    // Basic Info
    UI.cityName.textContent = location.name;
    UI.countryName.textContent = location.country || "";
    UI.currentDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    // Temperature & Description
    UI.temperature.textContent = Math.round(current.temperature_2m);
    UI.weatherDesc.textContent = weatherInfo.desc;
    
    // Icons
    UI.bgContainer.style.background = weatherInfo.bg;
    
    // Stats
    UI.humidity.textContent = `${current.relative_humidity_2m}%`;
    UI.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    UI.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    
    // Forecast Grid
    UI.forecastGrid.innerHTML = '';
    for (let i = 1; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayCode = daily.weather_code[i];
        const dayInfo = WMO_CODES[dayCode] || { desc: "Unknown", icon: "❓" };
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <span class="forecast-day">${dayName}</span>
            <span class="forecast-icon" style="font-size: 2rem;">${dayInfo.icon}</span>
            <div class="forecast-temp">
                <span>${maxTemp}°</span>
                <span class="low">${minTemp}°</span>
            </div>
        `;
        UI.forecastGrid.appendChild(card);
    }

    // Refresh Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    showContent();
}

function showLoading() {
    UI.loader.style.display = 'flex';
    UI.weatherContent.style.display = 'none';
    UI.welcome.style.display = 'none';
    UI.error.style.display = 'none';
}

function showContent() {
    UI.loader.style.display = 'none';
    UI.weatherContent.style.display = 'flex';
    UI.welcome.style.display = 'none';
    UI.error.style.display = 'none';
}

function showError() {
    UI.loader.style.display = 'none';
    UI.weatherContent.style.display = 'none';
    UI.welcome.style.display = 'none';
    UI.error.style.display = 'block';
}
