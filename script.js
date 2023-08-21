const API_KEY = '36b666dc3e2e7bd617f6d9fc250969ff';

let cityArray = new Array();
let currentWeatherObject = new Object();
let fiveDayArray = new Array();

/* selectors */

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('city-input');
const searchButton = document.getElementById('city-button');
const currentWeather = document.getElementById('current-container');
const currentCityDate = document.getElementById('current-city-date');
const currentIcon = document.getElementById('current-icon');
const currentTemp = document.getElementById('current-temp');
const currentWind = document.getElementById('current-wind');
const currentHumidity = document.getElementById('current-humidity');
const forecastContainer = document.getElementById('forecast-container');

/* event listeners */

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  searchInput.value = '';
});

searchButton.addEventListener('click', async () => {
  const city = searchInput.value;
  updateHistory(city);
  fetchCityWeather(city);
});

/* functions */

function fetchCityWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      fetchWeatherData(lat, lon);
    })
    .catch((error) => console.log(error));
}

function fetchWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=imperial&appid=${API_KEY}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      initWeatherObjects();
      populateCurrentWeather(data);
      populateFiveDayWeather(data);
      populateUI();
    })
    .catch((error) => console.log(error));
}

function populateCurrentWeather(data) {
  currentWeatherObject.date = new Date().toISOString().split('T')[0];
  currentWeatherObject.city = data.city.name;
  currentWeatherObject.temp = data.list[0].main.temp;
  currentWeatherObject.wind = data.list[0].wind.speed;
  currentWeatherObject.humidity = data.list[0].main.humidity;
  currentWeatherObject.icon_url = `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`;
}

function populateFiveDayWeather(data) {
  const list = data.list;
  for (let i = 0; i < list.length; i++) {
    let cnt = 0;
    const date = list[i].dt_txt.split(' ')[0];
    const icon = list[i].weather[0].icon;
    const temp = list[i].main.temp;
    const wind = list[i].wind.speed;
    const humidity = list[i].main.humidity;

    for (let j = 0; j < fiveDayArray.length; j++) {
      // attempting to get as close to noon as possible
      cnt = cnt++;
      if (date === fiveDayArray[j].date && cnt < 5) {
        fiveDayArray[
          j
        ].icon = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        fiveDayArray[j].temp = temp;
        fiveDayArray[j].wind = wind;
        fiveDayArray[j].humidity = humidity;
      }
    }
  }
}

function populateUI() {
  // populate current weather
  currentCityDate.textContent = `${currentWeatherObject.city} (${currentWeatherObject.date})`;
  currentIcon.src = currentWeatherObject.icon_url;
  currentTemp.textContent = `Temp: ${currentWeatherObject.temp} °F`;
  currentWind.textContent = `Wind: ${currentWeatherObject.wind} MPH`;
  currentHumidity.textContent = `Humidity: ${currentWeatherObject.humidity} %`;

  // clear five day forecast
  while (forecastContainer.firstChild) {
    forecastContainer.removeChild(forecastContainer.firstChild);
  }

  // populate five day forecast
  for (let i = 0; i < fiveDayArray.length; i++) {
    const forecastCard = document.createElement('div');
    forecastCard.classList.add('forecast-card');
    const forecastDate = document.createElement('h3');
    forecastDate.textContent = fiveDayArray[i].date;
    const forecastIcon = document.createElement('img');
    forecastIcon.src = fiveDayArray[i].icon;
    const forecastTemp = document.createElement('p');
    forecastTemp.textContent = `Temp: ${fiveDayArray[i].temp} °F`;
    const forecastWind = document.createElement('p');
    forecastWind.textContent = `Wind: ${fiveDayArray[i].wind} MPH`;
    const forecastHumidity = document.createElement('p');
    forecastHumidity.textContent = `Humidity: ${fiveDayArray[i].humidity} %`;
    forecastCard.appendChild(forecastDate);
    forecastCard.appendChild(forecastIcon);
    forecastCard.appendChild(forecastTemp);
    forecastCard.appendChild(forecastWind);
    forecastCard.appendChild(forecastHumidity);
    forecastContainer.appendChild(forecastCard);
  }
}

function updateHistory(city) {
  if (city) {
    // update array and local storage
    cityArray.push(city);
    localStorage.setItem('weather', JSON.stringify(cityArray));
  }

  const cityHistory = document.getElementById('city-history');

  // clear history
  while (cityHistory.firstChild) {
    cityHistory.removeChild(cityHistory.firstChild);
  }

  // update UI portion
  for (let i = 0; i < cityArray.length; i++) {
    const cityHistoryButton = document.createElement('button');
    cityHistoryButton.classList.add('history-button');
    cityHistoryButton.textContent = cityArray[i];
    cityHistory.insertBefore(cityHistoryButton, cityHistory.childNodes[0]);

    // add event listener to button
    cityHistoryButton.addEventListener('click', () => {
      fetchCityWeather(cityArray[i]);
    });
  }
}

function initLocalStorage() {
  if (localStorage.getItem('weather') !== null) {
    const localString = localStorage.getItem('weather');
    cityArray = JSON.parse(localString);
    updateHistory();
  }
}

function initWeatherObjects() {
  const today = new Date();

  currentWeatherObject = new Object();
  fiveDayArray = new Array();

  currentWeatherObject.date = today.toISOString().split('T')[0];

  for (let i = 1; i < 6; i++) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + i);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    fiveDayArray.push({
      date: formattedDate,
      icon: '',
      temp: '',
      wind: '',
      humidity: '',
    });
  }
}

/* on page load */
initLocalStorage();
