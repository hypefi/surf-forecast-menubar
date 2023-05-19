const { shell } = require("electron");
const ipc = require("electron").ipcRenderer;
const remote = require("electron").remote;
const axios = require("axios");
// const moment = require('moment');
// const labels = Array.from({length: 7}, (_, i) => moment().month(i).format('MMMM'));

// const fs = require('fs');
const fs = require("fs").promises;

// Read the JSON file

let data;

async function loadData() {
  try {
    let wave_jsondata = await getData("wave", {
      spotId: "5842041f4e65fad6a7708890",
      days: 1,
      intervalHours: 2,
    });
    let tides_jsondata = await getData("tides", {
      spotId: "5842041f4e65fad6a7708890",
      days: 1,
      intervalHours: 2,
    });
    let wind_jsondata = await getData("wind", {
      spotId: "5842041f4e65fad6a7708890",
      days: 1,
      intervalHours: 2,
    });
    let weather_jsondata = await getData("weather", {
      spotId: "5842041f4e65fad6a7708890",
      days: 1,
      intervalHours: 2,
    });

    console.log({ wave_jsondata });
    console.log({ wind_jsondata });
    console.log({ weather_jsondata });
    console.log({ tides_jsondata });
    // data = JSON.parse(jsondata); // You probably want to parse the JSON data before using it
    // wave_data = wave_jsondata.data; // You probably want to parse the JSON data before using it
    // tides_data = tides_jsondata.data; // You probably want to parse the JSON data before using it
    // console.log(wave_data);
    console.log(tides_jsondata);
    createCharts(wave_jsondata, tides_jsondata, wind_jsondata, weather_jsondata); // Call the function that creates the chart after the data is loaded
    //swells

    //tides

    //wind
    //weather
  } catch (err) {
    console.error(err);
  }
}

async function getData(type, params) {
  const baseURL = "https://services.surfline.com/kbyg/spots/forecasts/";

  let urlParams = new URLSearchParams(params).toString();
  let url = `${baseURL}${type}?${urlParams}`;

  console.log(url);
  let response = await axios.get(url);

  return response.data;
}

loadData(); // Call the function that loads the data

//Night time
// Define a helper function to determine whether a timestamp falls within "night" hours

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
// Night time end

function createCharts(wave_data, tide_data, wind_data, weather_data) {
  // Preparing your data for the chart

  console.log("chart");

  let wd = wave_data.data.wave;
  console.log(wd)
  let td = tide_data.data.tides;
  console.log(td);
  let wid = wind_data.data.wind;
  console.log(wid);
  let timestamps = wd.map((obj) => new Date(obj.timestamp * 1000));
  let surf_min = wd.map((obj) => obj.surf.min);
  let surf_max = wd.map((obj) => obj.surf.max);
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
  
  

  console.log(surf_min);
  console.log(surf_max);
  console.log(timestamps);

  const Chart = require("chart.js/auto").Chart;

  let ctx = document.getElementById("myChart").getContext("2d");
  let ctt = document.getElementById("tideChart").getContext("2d");
  let ctwi = document.getElementById("windChart").getContext("2d");

  let myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: timestamps,
      datasets: [
        {
          label: "surf_min",
          data: surf_min,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          cubicInterpolationMode: "monotone",
          borderColor: "rgba(75, 192, 192, 1)",
          pointStyle: false,
          borderWidth: 2,
          // tension: 3
        },
        {
          label: "surf_max",
          data: surf_max,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          cubicInterpolationMode: "default",
          borderColor: "rgba(100,149,237, 1)",
          pointStyle: false,
          borderWidth: 2,
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: false, // this will hide the x axis
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
        }
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
    })
    // plugins: [backgroundColorPlugin]


  // Wind Chart 
  let windChart = new Chart(ctwi, {
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
        }  
       ],
    },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            beginAtZero: true,
            stacked: true,  // This will cause bars to stack
          }
        }
      }
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
