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
  id: 'backgroundColorPlugin',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const xAxis = chart.scales['x'];
    const yAxis = chart.scales['y'];

    chart.data.labels.forEach((label, i) => {
      const x = xAxis.getPixelForTick(i);
      const nextX = xAxis.getPixelForTick(i + 1) || chart.width; // Use the chart width if there's no next tick
      const width = nextX - x;

      console.log("x, yAxis.top, width, yAxis.bottom - yAxis.top", x, yAxis.top, width, yAxis.bottom - yAxis.top)
      ctx.save();
      // ctx.fillStyle = isNightTime(label) ? 'grey' : 'white'; // Set fill color based on time
      // ctx.fillRect(x, yAxis.top, width, yAxis.bottom - yAxis.top);

      // Draw a vertical line at midnight
      if (isMidnight(label)) {
        ctx.beginPath();
        ctx.moveTo(x, yAxis.top);
        ctx.lineTo(x, yAxis.bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.stroke();
      }



      ctx.restore();
    });
  }
};
// night time end



function createChart() {
    // Preparing your data for the chart

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
            type: 'bar',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'surf_min',
                    data: surf_min,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    cubicInterpolationMode: 'monotone',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    pointStyle: false,
                    borderWidth: 2,
                    // tension: 3	
                },
                {
                    label: 'surf_max',
                    data: surf_max,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    cubicInterpolationMode: 'default',
                    borderColor: 'rgba(100,149,237, 1)',
                    pointStyle: false,
                    borderWidth: 2
                }]
    },
options: {
        scales: {
            x: {
                display: false // this will hide the x axis
            },
            y: {
                // you can leave the y-axis as is or configure it as needed
            }
        }
    },
  // plugins: [backgroundColorPlugin]
        });
    };

