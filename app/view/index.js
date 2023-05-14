const { shell } = require("electron");
const ipc = require("electron").ipcRenderer;
const remote = require("electron").remote;
// const remote = require('@electron/remote')
// const config = require("../../src/config");
// var path = require("path");
// const Chart = require('chart.js');
// const { Chart } = require('chart.js');


// const { Chart } = require('chart.js');
// import {Chart, LinearScale, PointElement, Tooltip, Legend, TimeScale} from "chart.js";

const moment = require('moment');
const labels = Array.from({length: 7}, (_, i) => moment().month(i).format('MMMM'));

// const { moment } = require('moment');
// const ChartMomentAdapter = require('chartjs-adapter-moment');

// const moment = require('chartjs-adapter-moment');

const fs = require('fs');

// Read the JSON file

let data;

fs.readFile('/Users/admin/Desktop/WORK/CODE/2023/surf-forecast/pyth-surf/waves.json', 'utf8', (err, jsondata) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(jsondata)
  data = jsondata; 
  // Parse the JSON data into a JavaScript object
  // const jsonData = JSON.parse(data);

  // Copy the contents to a variable
  // const data = jsonData;

  // Use the copiedData variable as needed
  // console.log(data);
});

// let data = [
//     {
//         "timestamp": 1683846000,
//         // "timestamp": 1,
//         "probability": 100,
//         "utcOffset": 1,
//         "surf_min": 1.5,
//         "surf_max": 2.1,
//         "surf_optimalScore": 2,
//         "surf_plus": false,
//         "surf_humanRelation": "Head to 0.6m overhead",
//         "surf_raw_min": 1.35825,
//         "surf_raw_max": 2.12227,
//     },
//     {
//         "timestamp": 1683849600,
//         // "timestamp": 2,
//         "probability": 100,
//         "utcOffset": 1,
//         "surf_min": 1.5,
//         "surf_max": 2.4,
//         "surf_optimalScore": 2,
//         "surf_plus": false,
//         "surf_humanRelation": "Head to well overhead",
//         "surf_raw_min": 1.36819,
//         "surf_raw_max": 2.1378,
//     }
//     // ... more data
// ];

// const labels = Utils.months({count: 7});

// const data2 = {
//   labels: labels,
//   datasets: [{
//     label: 'My First Dataset',
//     data: [65, 59, 80, 81, 56, 55, 40],
//     fill: false,
//     borderColor: 'rgb(75, 192, 192)',
//     tension: 0.1
//   }]
// };

// const config = {
//   type: 'line',
//   data: data2,
// };

// Preparing your data for the chart
let timestamps = data.map(obj => new Date(obj.timestamp * 1000));
let surf_min = data.map(obj => obj.surf_min);
let surf_max = data.map(obj => obj.surf_max);



document.addEventListener('DOMContentLoaded', () => {
    const Chart = require('chart.js/auto').Chart;

    let ctx = document.getElementById('myChart').getContext('2d');

    // let myChart = new Chart(ctx, config);
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: 'surf_min',
                data: surf_min,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'surf_max',
                data: surf_max,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        // options: {
        //     scales: {
        //         x: {
        //             type: 'time',
        //             display: true,
        //         },
        //         y: {
        //             display: true,
        //             beginAtZero: true
        //         }
        //     }
        // }
    });
});

// Creating the chart
// document.addEventListener('DOMContentLoaded', () => {
//     let ctx = document.getElementById('myChart').getContext('2d');

//     require(['chart.js', 'moment', 'chartjs-adapter-moment'], function(Chart, moment) {
//         let myChart = new Chart(ctx, {
//             type: 'line',
//             data: {
//                 labels: timestamps,
//                 datasets: [{
//                     label: 'surf_min',
//                     data: surf_min,
//                     backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                     borderColor: 'rgba(75, 192, 192, 1)',
//                     borderWidth: 1
//                 },
//                 {
//                     label: 'surf_max',
//                     data: surf_max,
//                     backgroundColor: 'rgba(255, 99, 132, 0.2)',
//                     borderColor: 'rgba(255, 99, 132, 1)',
//                     borderWidth: 1
//                 }]
//             },
//             options: {
//                 scales: {
//                     x: {
//                         type: 'time',
//                         time: {
//                             parser: moment,
//                             unit: 'hour'
//                         }
//                     },
//                     y: {
//                         beginAtZero: true
//                     }
//                 }
//             }
//         });
//     });
// });
