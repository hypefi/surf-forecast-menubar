const { Menu, Tray, app, BrowserWindow } = require('electron')
const os = require("os");

const Jimp = require('jimp');

const path = require('path');

const electron = require("electron");
// const AutoLaunch = require("auto-launch");
const { ipcMain } = require('electron');
// var cron = require('node-cron');

// const low = require("lowdb");
// const FileSync = require("lowdb/adapters/FileSync");
// const ShortcutManager = require("./components/shortcutManager");
// const config = require("./config");
const childProcess = require("child_process");

const { Notification, shell, dialog } = electron;

// const { Parser } = require("json2csv");
const ipc = electron.ipcMain;


let tray = null
let win = null 

 let icon_data_store = {
    conditions: null,
    tide_data_icon: null
  };
// app.whenReady().then(createWindow)
app.whenReady().then(() => {
tray = new Tray('./assets/icons/icons8-wave-22.png') // Provide the path to your tray icon here
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click: function() { win.show() } },
    { label: 'Quit', role: 'quit' }
  ])
  tray.setToolTip('My Electron Tray App')
  tray.setContextMenu(contextMenu)

  win = new BrowserWindow({
    width: 900,
    height: 450,
    show: false,
    frame: true, // change to true to be able to drag 
    fullscreenable: false,
    resizable: true,
    transparent: false,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
// win.loadFile('../app/view/index.html') // Load your application here
//
// console.log(win.webContents)
// win.webContents.openDevTools();
  setTimeout(() => {
    win.webContents.openDevTools()
  }, 2000);  // 2 seconds delay
win.loadURL('file:///Users/admin/Desktop/WORK/CODE/2023/surf-forecast/app/view/index.html') // Load your application here



console.log(win.webContents.isDevToolsOpened());
  win.on('blur', () => {
    if (!win.webContents.isDevToolsOpened()) {
      win.hide()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})


//helper

async function updateTrayIcon(cdata, tdata) {
  console.log("update tray")
  // let image = await Jimp.read(path.join(__dirname, '../assets/icons/icons8-wave-22.png'));
  // let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  // console.log(image)
  // console.log(font)
  // Get data for tray icon : current conditions, tide ↓ or rising ↑ and next hour of low or high  
  
  let count = 0;
  // console.log(cdata)
  let conditions = cdata.data.conditions;
  console.log(tdata)
// console.log(conditions)
// console.log(checkAMorPM())
// console.log(conditions[0][checkAMorPM()])
  let ch_ = checkAMorPM();
  let arrow_tide = (tdata.tideStatus == 'Rising') ? "R" : "F";
  let nexttidehour = tdata.nexttidehour;
  console.log(arrow_tide)

  // console.log(conditions[0][ch_].minHeight, "-" , conditions[0][ch_].maxHeight, "m") ;
  let icon_m = conditions[0][ch_].minHeight + "-" + conditions[0][ch_].maxHeight + cdata.associated.units.waveHeight.toLowerCase() + ' ' + arrow_tide + ' ' + nexttidehour;
  // console.log(conditions)
  
  let originalImage = await Jimp.read(path.join(__dirname, '../assets/icons/icons8-wave-22.png'));
  let font = await Jimp.loadFont(path.join(__dirname, '../assets/fonts/font22.fnt'));
  // let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  // Create a new, wider image
  let newWidth = originalImage.bitmap.width + 130; // Change '100' to the amount of extra width you need
  let newHeight = originalImage.bitmap.height;
  let extendedImage = new Jimp(newWidth, newHeight);

  // Composite the original image onto the new image
  extendedImage.composite(originalImage, 0, 0);

  // Create a text image to add to the original
  let textImage = new Jimp(130, 22); // Adjust size as needed
  textImage.print(font, 10, 0, {
    text: icon_m.toString(),
    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, textImage.bitmap.width, textImage.bitmap.height);

  // Composite the text image onto the new image, to the right of the original image
  extendedImage.composite(textImage, originalImage.bitmap.width, 0);



//   image.print(font, 0, 0, {
//     text: count.toString(),
//     alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
//     alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
//   }, image.bitmap.width, image.bitmap.height);
  
extendedImage.writeAsync('assets/jimpimage.png').then(() => {
    console.log('Image saved!');

const tmpPath = path.join(__dirname, '../assets/jimpimage.png');
    tray.setImage(tmpPath);

  }).catch(err => {
    console.error(err);
  });
  // console.log()
  // image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     tray.setImage(buffer);
  //   }
  // });
//
win.webContents.openDevTools();
}

// com
ipcMain.on('data-channel', (event, data) => {
  console.log(data.conditions); // Handle the received data
  console.log(data.tide_data_icon); // Handle the received data

  icon_data_store.conditions =  data.conditions;
  icon_data_store.tide_data_icon =  data.tide_data_icon
  // icon_data_store = data.conditions
  // icon_data_store = data.conditions
  updateTrayIcon(data.conditions, data.tide_data_icon);
});



// cron.schedule('* * * * *', async () => {
//   console.log('running a task every minute');
//    try {
//         console.log('Starting job...');

//         // Replace this with your function
//         await updateTrayIcon(icon_data_store.conditions, icon_data_store.tide_data_icon);
 

//         console.log('Job completed successfully');
//     } catch (error) {
//         console.error('An error occurred:', error);
//     }
//   console.log('run')
// });


let count = 0;
// setInterval(() => {
//     count++;
//     updateTrayIcon(count);
// }, 10000);

// Helper
function checkAMorPM() {
    const date = new Date();
    const hours = date.getHours();
    return hours < 12 ? 'am' : 'pm';
}
