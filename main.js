"use strict";

const permission = document.querySelector(".permision");
const positive = document.querySelector(".positive");
const negative = document.querySelector(".negative");
const error = document.querySelector(".error");
const API_KEY = '7349a447806db00a0c3e17bc9ef33b1f';
const RAIN_MARGIN = 8;

async function getData({url, options = {}}) {
    const response = await fetch(url, options);
    if(!response.ok){
        throw new Error('Error en la petición');
    }
    const data = await response.json();

    return data;
}

function showPanel(panel) {
  hideAllPanels();
  panel.classList.remove("hidden");
}

function hideAllPanels() {
  permission.classList.add("hidden");
  positive.classList.add("hidden");
  negative.classList.add("hidden");
  error.classList.add("hidden");
}

function showPositive({city, temperature, weather, nextRain}) {
    showPanel(positive);
    const text = positive.querySelector('p');
    text.innerHTML = `
    Ahora mismo hay ${temperature}ºC en ${city} con ${weather} y  ${
        nextRain > 0 
        ? `probablemente llueve en ${nextRain} horas`
        : 'está lloviendo ahora mismo'
    } 
    `;

}

function showNegative({city, temperature, weather}) {
    showPanel(negative);
    const text = negative.querySelector('p');
    text.innerHTML = `
    Ahora mismo hay ${temperature}ºC en ${city} con ${weather} y parece que no lloverá en las proximas ${RAIN_MARGIN} horas
    `;
}

 async function getWeatherData({latitude, longitude}) {
    try {
       const currentWeather = await getData({
           url: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=es`,
       });
       const nextHours = await getData({
           url:`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,daily&appid=${API_KEY}&units=metric&lang=es`
       });
       const nextRain = nextHours.hourly.findIndex((hour) => {
           return hour.weather[0].main === "Rain";
       });
       if(nextRain > -1 && nextRain <= RAIN_MARGIN){
        showPositive({
            city:currentWeather.name,
            temperature:currentWeather.main.temp,
            weather:currentWeather.weather[0].description,
            nextRain,
        })
       }else {
        showNegative({
            city:currentWeather.name,
            temperature:currentWeather.main.temp,
            weather:currentWeather.weather[0].description,        
        });
       }
    } catch (error) {
        showPanel(error);
    }
}

function getUserLocation() {
    hideAllPanels();
    navigator.geolocation.getCurrentPosition(
    (location) => {
       const { latitude, longitude } = location.coords;
        getWeatherData({latitude, longitude});
        localStorage.setItem('permission', 'ok');
    },
    () => {
        showPanel(error);
    }
  );
}

function main() {
    if(localStorage.getItem('permission' === 'ok')){
    getUserLocation() ;

    }else {

    showPanel(permission); 
    const permisionButton = permission.querySelector('button');

    permisionButton.onclick = () => {
    getUserLocation();
    }
  }
  
  
}

main();
