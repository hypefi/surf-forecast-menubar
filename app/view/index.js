const { shell } = require("electron");
const ipc = require("electron").ipcRenderer;
const remote = require("electron").remote;
const axios = require("axios");
// const moment = require('moment');
// const labels = Array.from({length: 7}, (_, i) => moment().month(i).format('MMMM'));


// const fs = require('fs');
const fs = require("fs").promises;


// Location, spot ID 
          
let spotId = "5842041f4e65fad6a7708cfb";

document.getElementById('locate').addEventListener('click', function() {
    let location = document.getElementById('location').value;
    let url = `https://services.surfline.com/search/site?q=${location}&querySize=10&suggestionSize=10&newsSearch=true`;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data)
        let spotList = document.getElementById('spot-list');
        console.log(spotList)
        try{
                spotList.innerHTML = ''; // Clear existing spot list
        }catch{
                
        }
        data.forEach(item => {
            console.log(item)
            if (item.hits.hits.length > 0 && item.hits.hits[0]._index === "spots") {
                console.log(item.hits.hits)
                let it = item.hits.hits;
                      it.forEach( x => {
                                      // let spotId = item.hits.hits[0]._id;
                                      // let spotName = item.hits.hits[0]._source.name;
                                      let spotId = x._id;
                                      let spotName = x._source.name;
                                      let spotLocation = x._source.breadCrumbs;

                                      // Create a new div element for the spot and add it to the spot list
                                      let newSpotItem = document.createElement('div');
                                      newSpotItem.textContent = "🌊" + spotName + "    " + spotLocation.join(', ');
                                      newSpotItem.classList.add('spot-button');
                                      newSpotItem.addEventListener('click', function() {
                                          console.log('Clicked on spot ID:', spotId);
                                          // You can add more code here to do something with the spot ID when the div is clicked
                                      });

                                      spotList.appendChild(newSpotItem);
                      } )
            }
        });
    })
    .catch(error => console.error('An error occurred:', error));
});




// Read the JSON file


let data;

async function loadData(spotId) {
  try {
    let wave_jsondata = await getData("wave", {
      spotId: spotId,
      days: 1,
      intervalHours: 3,
    });
    let tides_jsondata = await getData("tides", {
      spotId: spotId,
      days: 1,
      intervalHours: 3,
    });
    let wind_jsondata = await getData("wind", {
      spotId: spotId,
      days: 1,
      intervalHours: 3,
    });
    let weather_jsondata = await getData("weather", {
      spotId: spotId,
      days: 1,
      intervalHours: 1,
    });
    let rating_jsondata = await getData("rating", {
      spotId: spotId,
      days: 1,
      intervalHours: 3,
    });

    let conditions_jsondata = await getData("conditions", {
      spotId: spotId,
      days: 1,
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
    createCharts(
      wave_jsondata,
      tides_jsondata,
      wind_jsondata,
      weather_jsondata,
      rating_jsondata
    ); // Call the function that creates the chart after the data is loaded
    printdata(
      conditions_jsondata,
      wind_jsondata,
      tides_jsondata,
      weather_jsondata
    );
    //swells

    //tides

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

// loadData(spotId); // Call the function that loads the data

//Night time
// Define a helper function to determine whether a timestamp falls within "night" hours

function getH(timestamp) {
  const date = new Date(timestamp*1000);

  var hours = date.getHours();
  var minutes = date.getMinutes();

    // Convert minutes to decimal and add to hours
  var timeDecimal = hours + (minutes / 60);

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

// Define the Chart.js plugin
const backgroundColorPlugin = {
  id: "backgroundColorPlugin",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const xAxis = chart.scales["x"];
    const yAxis = chart.scales["y"];

    chart.data.labels.forEach((label, i) => {
      const x = xAxis.getPixelForTick(i);
      const nextX = xAxis.getPixelForTick(i + 1) || chart.width; // Use the chart width if there's no next tick
      const width = nextX - x;

      console.log(
        "x, yAxis.top, width, yAxis.bottom - yAxis.top",
        x,
        yAxis.top,
        width,
        yAxis.bottom - yAxis.top
      );
      ctx.save();
      // ctx.fillStyle = isNightTime(label) ? 'grey' : 'white'; // Set fill color based on time
      // ctx.fillRect(x, yAxis.top, width, yAxis.bottom - yAxis.top);

      // Draw a vertical line at midnight
      if (isMidnight(label)) {
        ctx.beginPath();
        ctx.moveTo(x, yAxis.top);
        ctx.lineTo(x, yAxis.bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
      }

      ctx.restore();
    });
  },
};


function convertTimestampToReadableHour(timestamp) {
  console.log(timestamp)
  const date = new Date(timestamp*1000);
  console.log(date)
  const hour = date.getHours();
  const minutes = date.getMinutes();

  console.log(hour, minutes)
  // Format the hour and minutes with leading zeros if necessary
  const formattedHour = hour.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

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
    for(let i = startFromIndex; i < data.length; i++) {
        // console.log(i)
        if(data[i].type === 'HIGH' || data[i].type === 'LOW') {
            return data[i];
        }
    }
    return null;
}


function printdata(conditions, wind, tides, weather) {
  let cd = conditions.data;
  let ac = conditions.associated;
  let wi = wind.data.wind;
  let un = wind.associated.units;
  let we = weather.data.weather;
  let tideData = tides.data.tides;

  console.log({ wi });
  console.log(wi);
  console.log(cd);
  console.log(tideData);
  console.log(we)

  var today = new Date();
  var currentHour = today.getHours();

  var surfInfo = cd.conditions[0]; // Considering data for today is the first element
  var timeOfDay = currentHour < 12 ? surfInfo.am : surfInfo.pm;

  // Getting the surf info div
  var surfInfoDiv = document.querySelector(".surf-info");

  // Adding the title
  var title = document.createElement("h2");
  title.textContent = "Surf Info for " + surfInfo.forecastDay;
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
        <h2> Wind </h2> 
        <p>Speed: ${closestWind.speed.toFixed(2)} ${un.windSpeed.toLowerCase()} </p>
        <p>Direction: ${closestWind.direction}</p>
        <p>Direction Type: ${closestWind.directionType}</p>
        <p>Gust: ${closestWind.gust.toFixed(2)} ${un.windSpeed.toLowerCase()} </p>
    `;
  let WeatherContent = `
        <h2> Weather </h2> 
        <p>Condition: ${closestWeather.condition}</p>
        <p>Temperature: ${closestWeather.temperature.toFixed(1)}${un.temperature} </p>
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


  let nextHighOrLowTide = findNextHighOrLowTide(tideData, closestTideData.closestTideIndex + 1);
  console.log(nextHighOrLowTide);
  let nextHighOrLowTideContent = nextHighOrLowTide ? `<p>Next ${nextHighOrLowTide.type} Tide Height: ${nextHighOrLowTide.height} ${un.waveHeight.toLowerCase()} at ${convertTimestampToReadableHour(nextHighOrLowTide.timestamp)} </p>` : '';


  let tideContent = `
        <h2> Tide </h2>
        <p>Height: ${closestTideData.closestTide.height} ${un.tideHeight.toLowerCase()} </p>
        <p>Tide Status: ${tideStatus}</p>
        ${nextHighOrLowTideContent}
    `;

  document.querySelector(".tide-info").innerHTML = tideContent;
}

function createCharts(wave_data, tide_data, wind_data, weather_data, ratings) {
  // Preparing your data for the chart

  console.log("chart");

  let wd = wave_data.data.wave;
  // console.log(wd)
  let td = tide_data.data.tides;
  // console.log(td);
  let wid = wind_data.data.wind;
  // console.log(wid);
  // const date = new Date(timestamp);
  let sl = weather_data.data.sunlightTimes[0];

  // const hour = date.getUTCHours();
  // const hour = date.getHours();

  let timestamps = wd.map((obj) => parseFloat(new Date(obj.timestamp * 1000).getHours()));
  console.log(timestamps[0])

  console.log("timestamps chart", timestamps)
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


  console.log("dawn" ,dawn, "sunrise", sunrise, "sunset", sunset, "dusk",  dusk)
  console.log(typeof sunrise);
  // console.log(typeof )
  // console.log(surf_min);
  // console.log(surf_max);
  // console.log(timestamps);

  const Chart = require("chart.js/auto").Chart;
  const annotationPlugin = require('chartjs-plugin-annotation');

  console.log("Ch1", Chart.registry)
  console.log("annotation plugin", annotationPlugin);
  Chart.register(annotationPlugin);

  console.log("Ch2", Chart.registry)

  let ctx = document.getElementById("myChart").getContext("2d");
  let ctt = document.getElementById("tideChart").getContext("2d");
  let ctwi = document.getElementById("windChart").getContext("2d");

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

  // var colors = opti_score.map((value) => {
  //   if (value < 30) {
  //     return 'rgba(75, 192, 192, 0.2)';  // color for values less than 30
  //   } else if (value < 70) {
  //     return 'rgba(255, 99, 132, 0.2)';  // color for values between 30 and 70
  //   } else {
  //     return 'rgba(255, 205, 86, 0.2)';  // color for values over 70
  //   }
  // });

  let tim = timestamps;

  let myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: tim,
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
            type: 'box',
            // xMin: 0,
            xMax: dawn,
            xScaleID: 'x',

            // yMin: 0,
            // yMax: 1,
            // drawTime: 'beforeDatasetsDraw',
            // xScaleID: 24,
            // yScaleID: 'y',
          //
adjustScaleRange: true,
            backgroundColor: 'rgba(88, 88, 88, 0.4)'
          },
          dawn: {
            // Indicates the type of annotation
            type: 'box',
            xMin: dawn,
            xMax: sunrise,
            // yMin: 0,
            // yMax: 1,
            // drawTime: 'beforeDatasetsDraw',
            xScaleID: 'x',
            // yScaleID: 'y',
            backgroundColor: 'rgba(88, 88, 88, 0.2'
          },
          dusk: {
            // Indicates the type of annotation
            type: 'box',
            xMin: sunset,
            xMax: dusk,
            // yMin: 0.2,
            // yMax: 0.9,
            drawTime: 'beforeDatasetsDraw',
            xScaleID: 'x',
            // yScaleID: 'y',
            backgroundColor: 'rgba(88, 88, 88, 0.2)'
          },
          night2: {
            // Indicates the type of annotation
            type: 'box',
            xMin: dusk,
            // xMax: ,
            // yMin: 0.2,
            // yMax: 0.9,
            drawTime: 'beforeDatasetsDraw',
            xScaleID: 'x',
            // yScaleID: 'y',
            backgroundColor: 'rgba(88, 88, 88, 0.4)'
          },
          // line1: {
          // type: 'line',
          // yMin: 1,
          // yMax: 1,
          // borderColor: 'rgb(88, 88, 88)',
          // borderWidth: 2,
          // }
        }
      }
    },
      scales: {
        x: {
          type: 'linear',
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
    // plugins: [backgroundColorPlugin]
  });

  // Tide Chart
  let tideChart = new Chart(ctt, {
    type: "bar",
    data: {
      labels: timestamps,
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
    // options: {
    //     responsive: true,
    //     tooltips: {
    //       mode: 'index', // Display all tooltips when hovering multiple bars
    //       intersect: false,
    //       callbacks: {
    //         title: function(tooltipItems, data) {
    //           // You can modify this function to return a string related to each bar
    //           const index = tooltipItems[0].index;
    //           return data.labels[index];
    //         },
    //         label: function(tooltipItems, data) {
    //           // You can modify this function to return a string related to each bar
    //           const dataset = data.datasets[tooltipItems.datasetIndex];
    //           const value = dataset.data[tooltipItems.index];
    //           return 'Value: ' + value;
    //         }
    //       }
    //     },
    scales: {
      x: {
        display: false, // this will hide the x axis
      },
      y: {
        // you can leave the y-axis as is or configure it as needed
      },
    },
  });
  // plugins: [backgroundColorPlugin]

  // Wind Chart
  let windChart = new Chart(
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
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            beginAtZero: true,
            stacked: true, // This will cause bars to stack
          },
        },
      },
      // options: {
      //     responsive: true,
      //     tooltips: {
      //       mode: 'index', // Display all tooltips when hovering multiple bars
      //       intersect: false,
      //       callbacks: {
      //         title: function(tooltipItems, data) {
      //           // You can modify this function to return a string related to each bar
      //           const index = tooltipItems[0].index;
      //           return data.labels[index];
      //         },
      //         label: function(tooltipItems, data) {
      //           // You can modify this function to return a string related to each bar
      //           const dataset = data.datasets[tooltipItems.datasetIndex];
      //           const value = dataset.data[tooltipItems.index];
      //           return 'Value: ' + value;
      //         }
      //       }
      //     },
      // scales: {
      //   x: {
      //     display: false, // this will hide the x axis
      //   },
      //   y: {
      //     // you can leave the y-axis as is or configure it as needed
      //   },
      // },
    }
    // plugins: [backgroundColorPlugin]
  );
}


