const { shell } = require("electron");
const ipc = require("electron").ipcRenderer;
const remote = require("electron").remote;
// const remote = require('@electron/remote')
// const config = require("../../src/config");
// var path = require("path");
const Chart = require('chart.js');
const moment = require('chartjs-adapter-moment');


let data = [
    {
        "timestamp": 1683846000,
        "probability": 100,
        "utcOffset": 1,
        "surf_min": 1.5,
        "surf_max": 2.1,
        "surf_optimalScore": 2,
        "surf_plus": false,
        "surf_humanRelation": "Head to 0.6m overhead",
        "surf_raw_min": 1.35825,
        "surf_raw_max": 2.12227,
    },
    {
        "timestamp": 1683849600,
        "probability": 100,
        "utcOffset": 1,
        "surf_min": 1.5,
        "surf_max": 2.4,
        "surf_optimalScore": 2,
        "surf_plus": false,
        "surf_humanRelation": "Head to well overhead",
        "surf_raw_min": 1.36819,
        "surf_raw_max": 2.1378,
    }
    // ... more data
];

// Preparing your data for the chart
let timestamps = data.map(obj => new Date(obj.timestamp * 1000));
let surf_min = data.map(obj => obj.surf_min);
let surf_max = data.map(obj => obj.surf_max);

// Creating the chart
let ctx = document.getElementById('myChart').getContext('2d');
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
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'hour'
                }
            },
            y: {
                beginAtZero: true
            }
        }
    }
});

