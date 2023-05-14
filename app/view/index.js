const { shell } = require("electron");
const ipc = require("electron").ipcRenderer;
const remote = require("electron").remote;

const moment = require('moment');
// const labels = Array.from({length: 7}, (_, i) => moment().month(i).format('MMMM'));


// const fs = require('fs');
const fs = require('fs').promises;

// Read the JSON file

let data;


async function loadData() {
    try {
        let jsondata = await fs.readFile('/Users/admin/Desktop/WORK/CODE/2023/surf-forecast/pyth-surf/waves.json', 'utf8');
        console.log(jsondata);
        data = JSON.parse(jsondata); // You probably want to parse the JSON data before using it
        console.log(data);
        createChart(); // Call the function that creates the chart after the data is loaded
    } catch (err) {
        console.error(err);
    }
}

loadData(); // Call the function that loads the data

function createChart() {
    // Prepar(ring your data for the chart
//
    console.log("chart")

    let timestamps = data.map(obj => new Date(obj.timestamp * 1000));
    let surf_min = data.map(obj => obj.surf_min);
    let surf_max = data.map(obj => obj.surf_max);

    console.log(surf_min)
    console.log(surf_max)
    console.log(timestamps)

        const Chart = require('chart.js/auto').Chart;

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
            }
        });
    };

