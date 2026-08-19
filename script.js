// button and inputs
let search = document.querySelector(".search button");
let searchInput = document.querySelector(".search input");

let form = document.getElementById("weatherForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();   // stop page reload

  if (searchInput.value.trim() !== "") {
    getWeatherData(searchInput.value);
  }
});


//for the weather element
let city = document.querySelector(".city");
let temperature = document.querySelector(".temp");
let pressure = document.querySelectorAll(".value")[0];
let humidity = document.querySelectorAll(".value")[1];
let wind = document.querySelectorAll(".value")[2];
let direction = document.querySelectorAll(".value")[3];
let description = document.querySelector(".weatherdata h2");
let icon = document.getElementById("weathericon");
let dates = document.querySelector('.date');

//the api key
const apikey = "YOUR_API_KEY_HERE";

// Function to save to database
async function saveToDatabase(weatherData) {
  try {
    await fetch('weather.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(weatherData)
    });
  } catch (error) {
    console.log("Database save failed (offline or error):", error);
  }
}

// wind direction
function getWindDirection(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// Modified function with Local Storage - Following Prototype 3 Guidelines
async function getWeatherData(cityName) {
  let data;
  
  try {
    // Step 1: Check if browser is online
    if (navigator.onLine) {
      console.log("Browser is ONLINE - Fetching from API");
      
      // Step 2: If online, fetch data from the API
      let response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
      );
      
      data = await response.json();
      console.log("Data fetched from API:", data);
      
      // Step 3: Save data to localStorage
      localStorage.setItem(cityName, JSON.stringify(data));
      console.log("Data saved to localStorage for:", cityName);
      
    } else {
      console.log("Browser is OFFLINE - Loading from localStorage");
      
      // Step 4: If offline, retrieve data from localStorage
      const cachedData = localStorage.getItem(cityName);
      
      if (cachedData) {
        data = JSON.parse(cachedData);
        console.log("Data loaded from localStorage:", data);
      } else {
        console.log("No cached data found for:", cityName);
        city.innerText = "No cached data";
        temperature.innerText = "--";
        pressure.innerText = "--";
        humidity.innerText = "--";
        wind.innerText = "--";
        direction.innerText = "--";
        description.innerText = "Offline - No Cache";
        icon.src = "";
        dates.innerText = "";
        return;
      }
    }
    
    // Step 5: Extract necessary information and Step 6: Update HTML elements
    
    //if city isnt found
    if (data.cod === "404") {
      city.innerText = "City not found";
      temperature.innerText = "--";
      pressure.innerText = "--";
      humidity.innerText = "--";
      wind.innerText = "--";
      direction.innerText = "--";
      description.innerText = "Invalid city name";
      icon.src = "";
      dates.innerText = "";
      return;
    }

    //For updating ui
    city.innerText = data.name;
    temperature.innerText = `${(data.main.temp - 273.15).toFixed(1)}°C`;
    pressure.innerText = `${data.main.pressure} hPa`;
    humidity.innerText = `${data.main.humidity}%`;
    wind.innerText = `${data.wind.speed} m/s`;
    direction.innerText = getWindDirection(data.wind.deg);
    description.innerText = data.weather[0].main;
    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Date for the data showcase - Fixed month to show 1-12 instead of 0-11
    let today = new Date();
    let date = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();

    // Show if data is from cache
    if (navigator.onLine) {
      dates.innerText = `${date}/${month}/${year}`;
    } else {
      dates.innerText = `${date}/${month}/${year} (Cached)`;
    }

    // Save to database - only when online
    if (navigator.onLine) {
      await saveToDatabase({
        city: data.name,
        temperature: (data.main.temp - 273.15).toFixed(1),
        weather_description: data.weather[0].main,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        wind_direction: getWindDirection(data.wind.deg),
        pressure: data.main.pressure
      });
    }

  } catch (error) {
    console.log("Error occurred:", error);
    
    // Try localStorage as fallback on error
    console.log("Trying localStorage as fallback...");
    const cachedData = localStorage.getItem(cityName);
    
    if (cachedData) {
      data = JSON.parse(cachedData);
      console.log("Using cached data after error:", data);
      
      //For updating ui with cached data
      city.innerText = data.name;
      temperature.innerText = `${(data.main.temp - 273.15).toFixed(1)}°C`;
      pressure.innerText = `${data.main.pressure} hPa`;
      humidity.innerText = `${data.main.humidity}%`;
      wind.innerText = `${data.wind.speed} m/s`;
      direction.innerText = getWindDirection(data.wind.deg);
      description.innerText = data.weather[0].main;
      icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      let today = new Date();
      let date = today.getDate();
      let month = today.getMonth() + 1;
      let year = today.getFullYear();
      dates.innerText = `${date}/${month}/${year} (Cached)`;
    } else {
      console.log("No cached data available");
    }
  }
}

//search button work
search.addEventListener("click", () => {
  if (searchInput.value.trim() !== "") {
    getWeatherData(searchInput.value);
  }
});

// Enter key support
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && searchInput.value.trim() !== "") {
    getWeatherData(searchInput.value);
  }
});

// for the default city newcastle
getWeatherData("Coventry");

// Optional: Display online/offline status
window.addEventListener('online', () => {
  console.log("Connection restored - Back online!");
});

window.addEventListener('offline', () => {
  console.log("Connection lost - Now offline!");
});