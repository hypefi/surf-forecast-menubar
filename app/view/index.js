const { shell } = require("electron");
// const ipc = require("electron").ipcRenderer;
const remote = require("electron").remote;
const axios = require("axios");

const os = require('os');
const path = require('path');

var cron = require('node-cron');
// Getting the home directory
const homeDir = os.homedir();
// Construct the path to the database file
const dbPath = path.join(homeDir, '.surf', 'DB_Store');
// const moment = require('moment');
// const labels = Array.from({length: 7}, (_, i) => moment().month(i).format('MMMM'));

// const Store = require('electron-store');

// const store = new Store();
// const fs = require('fs');
const fs = require("fs").promises;

// Renderer process
const { ipcRenderer } = require('electron');
// Location, spot ID
//
const { JsonDB , Config } = require('node-json-db')
// const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;/

var db = new JsonDB(new Config(dbPath, true, false, '/'));

let spotId;

// console.log(db)
// store all 5 days data from first API call 
let wave_jsondata;
let tides_jsondata; 
let wind_jsondata;
let weather_jsondata; 
let rating_jsondata;
let conditions_jsondata; 

let currentIndex = 0;


//store temp chart data when clickiing arrow up and down
let temp_wavejson = wave_jsondata;
let temp_tidesjson = tides_jsondata;
let temp_windjson = wind_jsondata;
let temp_weatherjson = weather_jsondata;
let temp_ratingjson = rating_jsondata;
let temp_conditionsjson = conditions_jsondata;


let storedSpotId;
let storedSpotName;
try{
  (async function() {
  console.log("async")
  console.log(db)
  let data = await db.getData("/")
  console.log(data)
  storedSpotId = await db.getData("/spotId");
  storedSpotName = await db.getData("/spotName");

  console.log(storedSpotId)
  console.log(storedSpotName)
  document.getElementById("c_conditions").innerHTML = "Current Conditions" + " in " + storedSpotName;
  })();
}catch{
  storedSpotId = null; //change to bouznika spotid 
  storedSpotName = "Bouznika";
  document.getElementById("c_conditions").innerHTML = "Current Conditions" + " in " + "Bouznika";
}

// let storedSpotId = null;
// let storedSpotName = null;
console.log(storedSpotId);
console.log(storedSpotName);
// let spotName = null;

if(storedSpotId){
spotId = storedSpotId;

}else{
//default one
spotId = "5842041f4e65fad6a7708cfb";
 

}

let swellChart = null;
let tideChart = null;
let windChart = null;

document.getElementById("locate").addEventListener("click", function () {
  let location = document.getElementById("location").value;
  let url = `https://services.surfline.com/search/site?q=${location}&querySize=10&suggestionSize=10&newsSearch=true`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      let spotList = document.getElementById("spot-list");
      console.log(spotList);
      try {
        spotList.innerHTML = ""; // Clear existing spot list
      } catch {}

      let isSpotFound = false;

      data.forEach((item) => {
        console.log(item);
        if (item.hits.hits.length > 0 && item.hits.hits[0]._index === "spots") {
          isSpotFound = true;
          console.log(item.hits.hits);
          let it = item.hits.hits;
          it.forEach((x) => {
            // let spotId = item.hits.hits[0]._id;
            // let spotName = item.hits.hits[0]._source.name;
            let spotId = x._id;
            let spotName = x._source.name;
            let spotLocation = x._source.breadCrumbs;



            let iconImgUrl = "../static/icons8-location-40.png";

            // Create a new div element for the spot and add it to the spot list
            let newSpotItem = document.createElement("div");
            // newSpotItem.textContent = "" + spotName + "<img src=" + iconImgUrl + " alt='icon'>" + spotLocation.join(', ');
            newSpotItem.textContent =
              "" + spotName + "                  " + spotLocation.join(", ");
            newSpotItem.classList.add("spot-button");
            newSpotItem.addEventListener("click", function () {
              console.log("Clicked on spot ID:", spotId);
              // You can add more code here to do something with the spot ID when the div is clicked
              //change location must be stored in config, to stay even when you quit application
              //
            document.getElementById("c_conditions").innerHTML = "Current Conditions" + " in " + spotName;
              try {
                db.push('/spotId', spotId);
                db.push('/spotName', spotName);
                console.log('SpotId stored successfully.');
              } catch (error) {
                console.error('Error storing spotId:', error);
              }
              // store.set('LocationId', spotId);
              // store.set('LocationName', spotName);
              // store.set('spotLocation', spotLocation.join(', '));
              loadData(spotId); // Call the function that loads the data
              //
              //
              spotList = document.getElementById("spot-list");
              console.log(spotList)

              while(spotList.firstChild) {
                  spotList.removeChild(spotList.firstChild);
              }
            });

            spotList.appendChild(newSpotItem);
          });
        }
        // else{
        // let newSpotItem = document.createElement('div');

        // newSpotItem.textContent = "No spot found with this name, try another! ";
        // spotList.appendChild(newSpotItem);
        // }
      });

      if (!isSpotFound) {
        let newSpotItem = document.createElement("div");
        newSpotItem.textContent = "No spot found with this name, try another!";
        spotList.appendChild(newSpotItem);
      }
    })
    .catch((error) => console.error("An error occurred:", error));
});



//Auto-Locate              
document.getElementById("auto-locate").addEventListener("click", async function () {
    // const { latitude, longitude } = { 34.020882, -6.841650 };

    let distance, rectangle;
    let latitude, longitude;          
    // let { latitude, longitude } = { latitude: 34.020882, longitude: -6.841650 };
    console.log({latitude, longitude});

    try {
        const response = await fetch('http://ip-api.com/json');
        const data = await response.json();

        const country = data.country;
        const region = data.regionName;
        const city = data.city;
        const zipCode = data.zip;

        latitude = data.lat;
        longitude = data.lon;

        console.log(`Latitude: ${latitude}`);
        console.log(`Longitude: ${longitude}`);
        console.log(`Country: ${country}`);
        console.log(`Region: ${region}`);
        console.log(`City: ${city}`);
        console.log(`ZIP Code: ${zipCode}`);
        
        distance = 50;
        rectangle = getRectangleEdges(latitude, longitude, distance);

    } catch (error) {
        console.log('Error:', error);
    }

    console.log(rectangle);

    let url = `https://services.surfline.com/kbyg/mapview?south=${rectangle.south}&west=${rectangle.west}&north=${rectangle.north}&east=${rectangle.east}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const r_data = await response.json();

        console.log(r_data);
        let spotList = document.getElementById("spot-list");
        console.log(spotList);

        try {
            spotList.innerHTML = ""; 
        } catch {}

        let isSpotFound = false;

        r_data.data.spots.forEach((item) => {
            console.log(item);
            
            isSpotFound = true;
            console.log(item);
            let spotId = item._id;
            let spotName = item.name;
            let spotConditions = item.conditions;
            
            let iconImgUrl = "../static/icons8-location-40.png";

            let newSpotItem = document.createElement("div");
            newSpotItem.textContent =
                "" + spotName + "                  " ;
            newSpotItem.classList.add("spot-button");
            newSpotItem.addEventListener("click", function () {
                console.log("Clicked on spot ID:", spotId);
                document.getElementById("c_conditions").innerHTML = "Current Conditions" + " in " + spotName;
                try {
                    db.push('/spotId', spotId);
                    db.push('/spotName', spotName);
                    console.log('SpotId stored successfully.');
                } catch (error) {
                    console.error('Error storing spotId:', error);
                }
                loadData(spotId); 
                
                spotList = document.getElementById("spot-list");
                console.log(spotList)

                while(spotList.firstChild) {
                    spotList.removeChild(spotList.firstChild);
                }
            });

            spotList.appendChild(newSpotItem);
        });

        if (!isSpotFound) {
            let newSpotItem = document.createElement("div");
            newSpotItem.textContent = "No spot found with this name, try another!";
            spotList.appendChild(newSpotItem);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }


});

// Read the JSON file

let data;

async function loadData(spotId) {
  try {
     wave_jsondata = await getData("wave", {
      spotId: spotId,
      days: 5,
      intervalHours: 3,
    });
     tides_jsondata = await getData("tides", {
      spotId: spotId,
      days: 5,
      intervalHours: 3,
    });
     wind_jsondata = await getData("wind", {
      spotId: spotId,
      days: 5,
      intervalHours: 3,
    });
     weather_jsondata = await getData("weather", {
      spotId: spotId,
      days: 5,
      intervalHours: 1,
    });
     rating_jsondata = await getData("rating", {
      spotId: spotId,
      days: 5,
      intervalHours: 3,
    });

     conditions_jsondata = await getData("conditions", {
      spotId: spotId,
      days: 5,
      // intervalHours: 3,
    });

    console.log({ wave_jsondata });
    console.log({ wind_jsondata });
    console.log({ weather_jsondata });
    console.log({ tides_jsondata });
    console.log({ rating_jsondata });
    console.log({ conditions_jsondata });
    // data = JSON.parse(jsondata); // You probably want to parse the JSON data before using it
    // wave_data = wave_jsondata.data; // You probably want to parse the JSON data before using it
    // tides_data = tides_jsondata.data; // You probably want to parse the JSON data before using it
    // console.log(wave_data);
    console.log(tides_jsondata);
    console.log({ swellChart });
    if (swellChart == null) {
      update_data = false;
    } else {
      update_data = true;
    }


    temp_wavejson = JSON.parse(JSON.stringify(wave_jsondata));
wave_jsondata;
    temp_tidesjson = JSON.parse(JSON.stringify( tides_jsondata));
    temp_windjson = JSON.parse(JSON.stringify( wind_jsondata));
    temp_weatherjson = JSON.parse(JSON.stringify( weather_jsondata));
    temp_ratingjson = JSON.parse(JSON.stringify( rating_jsondata));
    temp_conditionsjson = JSON.parse(JSON.stringify( conditions_jsondata));
   // console.log(wave_jsondata.data.wave)
   //  wave_jsondata.data.wave = wave_jsondata.data.wave.slice(currentIndex*8, (currentIndex+1)*8 );
   //  console.log(wave_jsondata.data.wave)
    temp_wavejson.data.wave = wave_jsondata.data.wave.slice(currentIndex*8, (currentIndex+1)*8 );
    temp_tidesjson.data.tides = tides_jsondata.data.tides.slice(currentIndex*28, (currentIndex+1)*28 );
    temp_windjson.data.wind = wind_jsondata.data.wind.slice(currentIndex*8, (currentIndex+1)*8 );
    temp_weatherjson.data.weather = weather_jsondata.data.weather.slice(currentIndex*24, (currentIndex+1)*24 );
    temp_ratingjson.data.rating = rating_jsondata.data.rating.slice(currentIndex*8, (currentIndex+1)*8 );
    temp_conditionsjson.data.conditions = conditions_jsondata.data.conditions.slice(currentIndex, currentIndex + 1);

    // tides_jsondata.data.tides = tides_jsondata.data.tides.slice(data.slice(currentIndex*8, (currentIndex+1)*8 ));
    // wind_jsondata.data.wind = wind_jsondata.data.wind.slice(data.slice(currentIndex*8, (currentIndex+1)*8 ));
    // weather_jsondata.data.weather = weather_jsondata.data.weather.slice(data.slice(currentIndex*24, (currentIndex+1)*24 ));
    // rating_jsondata.data.rating = rating_jsondata.data.rating.slice(data.slice(currentIndex*8, (currentIndex+1)*8 ));
    // conditions_jsondata.data.rating = conditions_jsondata.data.rating.slice(data.slice(currentIndex, currentIndex + 1));


    console.log({ temp_wavejson });
    // console.log({ wind_jsondata });
    // console.log({ weather_jsondata });
    // console.log({ tides_jsondata });
    // console.log({ rating_jsondata });
    // console.log({ conditions_jsondata });



    createCharts(
      temp_wavejson,
      temp_tidesjson,
      temp_windjson,
      temp_weatherjson,
      temp_ratingjson,
      update_data
    ); // Call the function that creates the chart after the data is loaded
    // printdata(
    //   temp_conditionsjson,
    //   temp_windjson,
    //   temp_tidesjson,
    //   temp_weatherjson,
    //   update_data
    // );
    // createCharts(
    //   wave_jsondata,
    //   tides_jsondata,
    //   wind_jsondata,
    //   weather_jsondata,
    //   rating_jsondata,
    //   update_data
    // ); // Call the function that creates the chart after the data is loaded
    printdata(
      conditions_jsondata,
      wind_jsondata,
      tides_jsondata,
      weather_jsondata,
      update_data,
      0
  );
  //wind
  //weather
} catch (err) {
  console.error(err);
}
}

async function getData(type, params) {
  let baseURL;
  if (type == "conditions") {
    baseURL = "https://services.surfline.com/kbyg/regions/forecasts/";
  } else {
    baseURL = "https://services.surfline.com/kbyg/spots/forecasts/";
  }

  let urlParams = new URLSearchParams(params).toString();
  let url = `${baseURL}${type}?${urlParams}`;

  console.log(url);
  let response = await axios.get(url);

  return response.data;
}

loadData(spotId); // Call the function that loads the data

//Night time
// Define a helper function to determine whether a timestamp falls within "night" hours

function getH(timestamp) {
  const date = new Date(timestamp * 1000);

  var hours = date.getHours();
  var minutes = date.getMinutes();

  // Convert minutes to decimal and add to hours
  var timeDecimal = hours + minutes / 60;

  return parseFloat(timeDecimal.toFixed(2));
}

function isNightTime(timestamp) {
  // console.log(timestamp)
  const date = new Date(timestamp);

  // const hour = date.getUTCHours();
  const hour = date.getHours();
  // console.log(hour, "night?", hour >= 20 || hour < 6)

  // Define night hours as between 20:00 and 6:00 (You can adjust these as necessary)
  return hour >= 20 || hour < 6;
}

// Define a helper function to determine whether a timestamp is at midnight
function isMidnight(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Check if the time is 00:00
  return hours === 0 && minutes === 0;
}


function convertTimestampToReadableHour(timestamp) {
  console.log(timestamp);
  const date = new Date(timestamp * 1000);
  console.log(date);
  const hour = date.getHours();
  const minutes = date.getMinutes();

  console.log(hour, minutes);
  // Format the hour and minutes with leading zeros if necessary
  const formattedHour = hour.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  const readableHour = `${formattedHour}:${formattedMinutes}`;

  return readableHour;
}

// Night time end
// Function to find the closest timestamp to the current time
function findClosestTimestamp(data, currentTimestamp) {
  console.log(data);
  let closestTimestampIndex = data.reduce(
    (prev, curr, index) =>
      Math.abs(curr.timestamp - currentTimestamp) <
      Math.abs(data[prev].timestamp - currentTimestamp)
        ? index
        : prev,
    0
  );
  return data[closestTimestampIndex];
}

function findClosestTide(data, currentTimestamp) {
  let closestTideIndex = data.reduce(
    (prev, curr, index) =>
      Math.abs(curr.timestamp - currentTimestamp) <
      Math.abs(data[prev].timestamp - currentTimestamp)
        ? index
        : prev,
    0
  );
  return {
    closestTide: data[closestTideIndex],
    closestTideIndex: closestTideIndex,
  };
}

function findNextHighOrLowTide(data, startFromIndex) {
  for (let i = startFromIndex; i < data.length; i++) {
    // console.log(i)
    if (data[i].type === "HIGH" || data[i].type === "LOW") {
      return data[i];
    }
  }
  return null;
}

function printdata(conditions, wind, tides, weather, day_i) {
  let cd = conditions.data;
  let ac = conditions.associated;
  let wi = wind.data.wind;
  let un = wind.associated.units;
  let we = weather.data.weather;
  let tideData = tides.data.tides;

  // console.log({ wi });
  // console.log(wi);
  // console.log(cd);
  // console.log(tideData);
  // console.log(we);

  var today = new Date();
  today.setDate(today.getDate() + day_i);

  console.log({today});

              
  var currentHour = today.getHours();

  var surfInfo = cd.conditions[0]; // Considering data for today is the first element
  var timeOfDay = currentHour < 12 ? surfInfo.am : surfInfo.pm;

  let cday = getDayOfWeek(surfInfo.timestamp);

  console.log(surfInfo);
  // Getting the surf info div
  var surfInfoDiv = document.querySelector(".surf-info");


  // Removing all child elements
  while (surfInfoDiv.firstChild) {
    surfInfoDiv.removeChild(surfInfoDiv.firstChild);
  }

  // Adding the title
  var title = document.createElement("h2");
  title.textContent = "Surf Info for " + cday + " " + surfInfo.forecastDay;
  surfInfoDiv.appendChild(title);

  // Adding the observation
  var observation = document.createElement("p");
  observation.textContent = "Observation: " + timeOfDay.observation;
  surfInfoDiv.appendChild(observation);

  // Adding the min height
  var minHeight = document.createElement("p");
  minHeight.textContent =
    "Min - Max wave height: " +
    timeOfDay.minHeight +
    "-" +
    timeOfDay.maxHeight +
    ac.units.waveHeight.toLowerCase();
  surfInfoDiv.appendChild(minHeight);

  // Adding the max height
  // var maxHeight = document.createElement('p');
  // maxHeight.textContent = 'Max wave height: ' + + ' meters';
  // surfInfoDiv.appendChild(maxHeight);

  // Adding the human relation
  var humanRelation = document.createElement("p");
  humanRelation.textContent = "" + timeOfDay.humanRelation;
  surfInfoDiv.appendChild(humanRelation);
  // wind
  let currentTimeStamp = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
  let closestWind = findClosestTimestamp(wi, currentTimeStamp);
  let closestWeather = findClosestTimestamp(we, currentTimeStamp);

  let htmlContent = `
        <h2>
          <img src="../../assets/texticons/icons8-wind-64.png" alt="" style="width:30px;height:30px;"> Wind
        </h2>
        <p>Speed: ${closestWind.speed.toFixed(
          2
        )} ${un.windSpeed.toLowerCase()} </p>
        <p>Direction: ${closestWind.direction}</p>
        <p>Direction Type: ${closestWind.directionType}</p>
        <p>Gust: ${closestWind.gust.toFixed(
          2
        )} ${un.windSpeed.toLowerCase()} </p>
    `;
  let WeatherContent = `
        <h2>
          <img src="../../assets/texticons/icons8-partly-cloudy-day-64.png" alt="" style="width:30px;height:30px;"> Weather
        </h2>
        <p>Condition: ${closestWeather.condition}</p>
        <p>Temperature: ${closestWeather.temperature.toFixed(1)}${
    un.temperature
  } </p>
    `;

  document.querySelector(".wind-info").innerHTML = htmlContent;
  document.querySelector(".weather-info").innerHTML = WeatherContent;
  //tide
  let closestTideData = findClosestTide(tideData, currentTimeStamp);

  let tideStatus = "Unknown";
  if (closestTideData.closestTideIndex < tideData.length - 1) {
    if (
      tideData[closestTideData.closestTideIndex + 1].height >
      closestTideData.closestTide.height
    ) {
      tideStatus = "Rising";
    } else {
      tideStatus = "Falling";
    }
  }

  let nextHighOrLowTide = findNextHighOrLowTide(
    tideData,
    closestTideData.closestTideIndex + 1
  );
  console.log(nextHighOrLowTide);
  let nextHighOrLowTideContent = nextHighOrLowTide
    ? `<p>Next ${nextHighOrLowTide.type} Tide Height: ${
        nextHighOrLowTide.height
      } ${un.waveHeight.toLowerCase()} at ${convertTimestampToReadableHour(
        nextHighOrLowTide.timestamp
      )} </p>`
    : "";

  let tideContent = `
        <h2>
          <img src="../../assets/texticons/icons8-sea-waves-64.png" alt="" style="width:30px;height:30px;"> Tide 
        </h2>
        <p>Height: ${
          closestTideData.closestTide.height
        } ${un.tideHeight.toLowerCase()} </p>
        <p>Tide Status: ${tideStatus}</p>
        ${nextHighOrLowTideContent}
    `;

  document.querySelector(".tide-info").innerHTML = tideContent;
          // send data to icon 
  console.log({conditions})
  let tide_data_icon = { 'tideStatus': tideStatus, 'nexttidehour': convertTimestampToReadableHour(nextHighOrLowTide.timestamp) }
 
  ipcRenderer.send('data-channel', { conditions, tide_data_icon });

}

function createCharts(
  wave_data,
  tide_data,
  wind_data,
  weather_data,
  ratings,
  update_data
) {
  // Preparing your data for the chart

  console.log("chart");

  let wd = wave_data.data.wave;
  console.log(wd)
  let td = tide_data.data.tides;
  console.log(td);
  let wid = wind_data.data.wind;
  console.log(wid);
  // const date = new Date(timestamp);
  let sl = weather_data.data.sunlightTimes[0];

  // const hour = date.getUTCHours();
  // const hour = date.getHours();

  let timestamps = wd.map((obj) =>
    parseFloat(new Date(obj.timestamp * 1000).getHours())
  );

  let tide_timestamps = td.map((obj) =>
    parseFloat(new Date(obj.timestamp * 1000).getHours())
  );
  console.log(timestamps[0]);

  console.log("timestamps chart", timestamps);
  let surf_min = wd.map((obj) => obj.surf.min);
  let surf_max = wd.map((obj) => obj.surf.max);
  let opti_score = wd.map((obj) => obj.surf.optimalScore);
  //tide data
  // let timestamps = td.map((obj) => new Date(obj.timestamp * 1000));
  let tide_height = td.map((obj) => obj.height);
  let tide_type = td.map((obj) => obj.type);
  //winddata
  let wind_direction = wid.map((obj) => obj.direction);
  let wind_directionType = wid.map((obj) => obj.directionType);
  let wind_gust = wid.map((obj) => obj.gust);
  let wind_optimalScore = wid.map((obj) => obj.optimalScore);
  let wind_speed = wid.map((obj) => obj.speed);
  let wind_utcOffset = wid.map((obj) => obj.utcOffset);
  //weather data
  let sunrise = getH(sl.sunrise);
  let sunset = getH(sl.sunset);
  let dusk = getH(sl.dusk);
  let dawn = getH(sl.dawn);

  console.log({tide_height})
  console.log("dawn", dawn, "sunrise", sunrise, "sunset", sunset, "dusk", dusk);
  console.log(typeof sunrise);
  // console.log(typeof )
  // console.log(surf_min);
  // console.log(surf_max);
  // console.log(timestamps);

  const Chart = require("chart.js/auto").Chart;
  const annotationPlugin = require("chartjs-plugin-annotation");

  console.log("Ch1", Chart.registry);
  console.log("annotation plugin", annotationPlugin);
  Chart.register(annotationPlugin);

  console.log("Ch2", Chart.registry);

  let ctx = document.getElementById("myChart").getContext("2d");
  let ctt = document.getElementById("tideChart").getContext("2d");
  let ctwi = document.getElementById("windChart").getContext("2d");

  const cur_timestamp =  Math.floor( Date.now() / 1000) ;
  let now_time = getH(cur_timestamp)

  // Wave Chart

  // And this is your color array, based on another parameter

  // var conditions = ["VERY POOR", "POOR", "POOR TO FAIR", "FAIR", "FAIR TO GOOD", "GOOD", "EPIC", "NONE"];
  // console.log(ratings)

  var colors = ratings.data.rating.map((condition) => {
    // console.log(condition.rating.key)
    switch (condition.rating.key) {
      case "VERY_POOR":
        return "rgb(244, 73, 109,0.2)";
      case "POOR":
        return "rgb(255, 149, 0,0.2)";
      case "POOR_TO_FAIR":
        return "rgb(255, 205, 30,0.2)";
      case "FAIR":
        return "rgb(11, 214, 116,0.2)";
      case "FAIR_TO_GOOD":
        return "rgb(0, 147, 113,0.2)";
      case "GOOD":
        return "rgb(104, 81, 244,0.2)";
      case "EPIC":
        return "rgb(92, 0, 208,0.2)";
      case "NONE":
        return "rgb(77, 139, 167,0.2)";
      default:
        return "rgb(0, 0, 0,0.2)"; // default color in case the condition is not in the list
    }
  });



  console.log(update_data);
  if (update_data) {
    // Update surf dataset
    swellChart.data.datasets[0].data = surf_min;
    swellChart.data.datasets[1].data = surf_max;
    tideChart.data.datasets[0].data = tide_height;
    windChart.data.datasets[0].data =wind_speed;
    windChart.data.datasets[1].data =wind_gust;

    console.log({tide_height})
    // Update the chart
    swellChart.update();
    tideChart.update();
    windChart.update();
          
  } else {
    swellChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: timestamps,
        datasets: [
          {
            label: "surf_min",
            data: surf_min,
            backgroundColor: colors, // Pass the colors array here
            borderColor: colors.map((color) => color.replace("0.2", "1")),
            //backgroundColor: "rgba(75, 192, 192, 0.2)",
            // cubicInterpolationMode: "monotone",
            // borderColor: "rgba(75, 192, 192, 1)",
            pointStyle: false,
            borderWidth: 2,
            // tension: 3
          },
          {
            label: "surf_max",
            data: surf_max,
            backgroundColor: colors, // Pass the colors array here
            borderColor: colors.map((color) => color.replace("0.2", "1")),
            // backgroundColor: "rgba(255, 99, 132, 0.2)",
            // cubicInterpolationMode: "default",
            // borderColor: "rgba(100,149,237, 1)",
            pointStyle: false,
            borderWidth: 2,
          },
        ],
      },
      options: {
        plugins: {
          annotation: {
            annotations: {
              n1: {
                // Indicates the type of annotation
                type: "box",
                // xMin: 0,
                xMax: dawn,
                xScaleID: "x",

                // yMin: 0,
                // yMax: 1,
                // drawTime: 'beforeDatasetsDraw',
                // xScaleID: 24,
                // yScaleID: 'y',
                //
                adjustScaleRange: true,
                backgroundColor: "rgba(88, 88, 88, 0.4)",
              },
              dawn: {
                // Indicates the type of annotation
                type: "box",
                xMin: dawn,
                xMax: sunrise,
                // yMin: 0,
                // yMax: 1,
                // drawTime: 'beforeDatasetsDraw',
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.2",
              },
              dusk: {
                // Indicates the type of annotation
                type: "box",
                xMin: sunset,
                xMax: dusk,
                // yMin: 0.2,
                // yMax: 0.9,
                drawTime: "beforeDatasetsDraw",
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.2)",
              },
              night2: {
                // Indicates the type of annotation
                type: "box",
                xMin: dusk,
                // xMax: ,
                // yMin: 0.2,
                // yMax: 0.9,
                drawTime: "beforeDatasetsDraw",
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.4)",
              },
              line1: {
              type: 'line',
              xMin: now_time,
              xMax: now_time,
              borderColor: 'rgb(88, 88, 88)',
              borderWidth: 2,
              }
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 0,
            max: 24,
            ticks: {
              stepSize: 3,
            },
            labels: false,
            beginAtZero: true,
            stacked: true, // This will cause bars to stack
          },
          y: {
            // you can leave the y-axis as is or configure it as needed
          },
        },
      },
    });
    // Tide Chart
    tideChart = new Chart(ctt, {
      type: "bar",
      data: {
        labels: tide_timestamps,
        datasets: [
          {
            label: "tide height",
            data: tide_height,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            cubicInterpolationMode: "monotone",
            borderColor: "rgba(75, 192, 192, 1)",
            pointStyle: false,
            borderWidth: 2,
            // tension: 3
          },
        ],
      },
      options: {
        plugins: {
          annotation: {
            annotations: {
              n1: {
                // Indicates the type of annotation
                type: "box",
                // xMin: 0,
                xMax: dawn,
                xScaleID: "x",

                // yMin: 0,
                // yMax: 1,
                // drawTime: 'beforeDatasetsDraw',
                // xScaleID: 24,
                // yScaleID: 'y',
                //
                adjustScaleRange: true,
                backgroundColor: "rgba(88, 88, 88, 0.4)",
              },
              dawn: {
                // Indicates the type of annotation
                type: "box",
                xMin: dawn,
                xMax: sunrise,
                // yMin: 0,
                // yMax: 1,
                // drawTime: 'beforeDatasetsDraw',
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.2",
              },
              dusk: {
                // Indicates the type of annotation
                type: "box",
                xMin: sunset,
                xMax: dusk,
                // yMin: 0.2,
                // yMax: 0.9,
                drawTime: "beforeDatasetsDraw",
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.2)",
              },
              night2: {
                // Indicates the type of annotation
                type: "box",
                xMin: dusk,
                // xMax: ,
                // yMin: 0.2,
                // yMax: 0.9,
                drawTime: "beforeDatasetsDraw",
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.4)",
              },
              line1: {
              type: 'line',
              xMin: now_time,
              xMax: now_time,
              borderColor: 'rgb(88, 88, 88)',
              borderWidth: 2,
              }
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 0,
            max: 24,
            ticks: {
              stepSize: 3,
            },
            labels: false,
            beginAtZero: true,
            stacked: false, // This will cause bars to stack
          },
          y: {
            // you can leave the y-axis as is or configure it as needed
          },
        },
      },
      
    });
    // plugins: [backgroundColorPlugin]

    // Wind Chart
    windChart = new Chart(
      ctwi,
      {
        type: "bar",
        data: {
          labels: timestamps,
          datasets: [
            {
              label: "Wind Speed",
              data: wind_speed,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
            },
            {
              label: "Wind Gust",
              data: wind_gust,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 2,
            },
          ],
        },
      options: {
        plugins: {
          annotation: {
            annotations: {
              n1: {
                // Indicates the type of annotation
                type: "box",
                // xMin: 0,
                xMax: dawn,
                xScaleID: "x",

                // yMin: 0,
                // yMax: 1,
                // drawTime: 'beforeDatasetsDraw',
                // xScaleID: 24,
                // yScaleID: 'y',
                //
                adjustScaleRange: true,
                backgroundColor: "rgba(88, 88, 88, 0.4)",
              },
              dawn: {
                // Indicates the type of annotation
                type: "box",
                xMin: dawn,
                xMax: sunrise,
                // yMin: 0,
                // yMax: 1,
                // drawTime: 'beforeDatasetsDraw',
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.2",
              },
              dusk: {
                // Indicates the type of annotation
                type: "box",
                xMin: sunset,
                xMax: dusk,
                // yMin: 0.2,
                // yMax: 0.9,
                drawTime: "beforeDatasetsDraw",
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.2)",
              },
              night2: {
                // Indicates the type of annotation
                type: "box",
                xMin: dusk,
                // xMax: ,
                // yMin: 0.2,
                // yMax: 0.9,
                drawTime: "beforeDatasetsDraw",
                xScaleID: "x",
                // yScaleID: 'y',
                backgroundColor: "rgba(88, 88, 88, 0.4)",
              },
              line1: {
              type: 'line',
              xMin: now_time,
              xMax: now_time,
              borderColor: 'rgb(88, 88, 88)',
              borderWidth: 2,
              }
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 0,
            max: 24,
            ticks: {
              stepSize: 3,
            },
            labels: false,
            beginAtZero: true,
            stacked: true, // This will cause bars to stack
          },
          y: {
            // you can leave the y-axis as is or configure it as needed
          },
        },
      },
      }
      // plugins: [backgroundColorPlugin]
    );
  }

  console.log(swellChart);
}


cron.schedule('0 * * * *', async () => {
  console.log('running a task every hour ');
   try {
        console.log('Starting job...');

        // Get data f
        //get data
        // Replace this with your function
        loadData(storedSpotId);
 

        console.log('Job completed successfully');
    } catch (error) {
        console.error('An error occurred:', error);
    }
  console.log('run')
});

// update charts from arrows to get the next day or previous day
function updateChart(forward) {
    // If we're moving forward and there's still data ahead, increment the index
    if (forward && currentIndex < 4) {
        currentIndex++;
    }
    // If we're moving backward and there's still data behind, decrement the index
    else if (!forward && currentIndex > 0) {
        currentIndex--;
    }

    //deep copy
    temp_wavejson = JSON.parse(JSON.stringify(wave_jsondata));
wave_jsondata;
    temp_tidesjson = JSON.parse(JSON.stringify( tides_jsondata));
    temp_windjson = JSON.parse(JSON.stringify( wind_jsondata));
    temp_weatherjson = JSON.parse(JSON.stringify( weather_jsondata));
    temp_ratingjson = JSON.parse(JSON.stringify( rating_jsondata));
    temp_conditionsjson = JSON.parse(JSON.stringify( conditions_jsondata));

    console.log(wave_jsondata)
    console.log(temp_wavejson)
    console.log({currentIndex})
    // console.log(tides_jsondata.data.tides)
    // Get the new data window and update the chart's data
    temp_wavejson.data.wave = wave_jsondata.data.wave.slice(currentIndex*8, (currentIndex+1)*8 );
    temp_tidesjson.data.tides = tides_jsondata.data.tides.slice(currentIndex*28, (currentIndex+1)*28 );
    temp_windjson.data.wind = wind_jsondata.data.wind.slice(currentIndex*8, (currentIndex+1)*8 );
    temp_weatherjson.data.weather = weather_jsondata.data.weather.slice(currentIndex*24, (currentIndex+1)*24 );
    temp_ratingjson.data.rating = rating_jsondata.data.rating.slice(currentIndex*8, (currentIndex+1)*8 );
    temp_conditionsjson.data.conditions = conditions_jsondata.data.conditions.slice(currentIndex, currentIndex + 1);
    // update_data = true;

    console.log("debug", temp_wavejson.data.wave)
    // console.log(wave_jsondata.data.wave)
    
    // wave_jsondata    = windowedData.wave_jsondata    
    // tides_jsondata   = windowedData.tides_jsondata
    // wind_jsondata    = windowedData.wind_jsondata
    // weather_jsondata = windowedData.weather_jsondata
    // rating_jsondata  = windowedData.rating_jsondata

    createCharts(
      temp_wavejson,
      temp_tidesjson,
      temp_windjson,
      temp_weatherjson,
      temp_ratingjson,
      true
    ); // Call the function that creates the chart after the data is loaded
    printdata(
      temp_conditionsjson,
      temp_windjson,
      temp_tidesjson,
      temp_weatherjson,
      true,
      currentIndex
    );
}




const left_arrows = document.querySelectorAll('.arrow.left');
const right_arrows = document.querySelectorAll('.arrow.right');

left_arrows.forEach((button) => {
  button.addEventListener('click', () => {
    console.log(`Button ${button.id} was clicked!`);
    // call your function here
    updateChart(false) 
  });
});

right_arrows.forEach((button) => {
  button.addEventListener('click', () => {
    console.log(`Button ${button.id} was clicked!`);
    // call your function here
    updateChart(true) 
  });
});


// Map helpers 
//
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

function getRectangleEdges(centerLat, centerLon, distance) {
  const earthRadiusKm = 6371.0;

  // convert latitude and longitude into radians
  const centerLatRad = toRadians(centerLat);
  const centerLonRad = toRadians(centerLon);

  // calculate offsets in radians
  const latOffset = distance / earthRadiusKm;
  const lonOffset = distance / (earthRadiusKm * Math.cos(centerLatRad));

  // calculate the edge coordinates
  const south = toDegrees(centerLatRad - latOffset);
  const west = toDegrees(centerLonRad - lonOffset);
  const north = toDegrees(centerLatRad + latOffset);
  const east = toDegrees(centerLonRad + lonOffset);

  return { south, west, north, east };
}

//Other helpers
function getDayOfWeek(timestampInSeconds) {
    // Convert the timestamp from seconds to milliseconds
    var timestampInMilliseconds = timestampInSeconds * 1000;

    // Convert the timestamp into a Date object
    var dateObject = new Date(timestampInMilliseconds);

    // Get the day of the week
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dayOfWeekString = days[dateObject.getDay()];

    return dayOfWeekString;
}

