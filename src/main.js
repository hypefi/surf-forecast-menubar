const { Menu, Tray, app, BrowserWindow } = require('electron')
const os = require("os");

const Jimp = require('jimp');

const path = require('path');

const electron = require("electron");
// const AutoLaunch = require("auto-launch");

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

// app.whenReady().then(createWindow)
app.whenReady().then(() => {
tray = new Tray('./assets/icons/icons8-wave-22.png') // Provide the path to your tray icon here
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click: function() { win.show() } },
    { label: 'Quit', role: 'quit' }
  ])
  tray.setToolTip('My Electron Tray App')
  tray.setContextMenu(contextMenu)

  let count = 0;
  setInterval(() => {
    count++;
    updateTrayIcon(count);
  }, 10000);

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
win.loadURL('file:///Users/admin/Desktop/WORK/CODE/2023/surf-forecast/app/view/index.html') // Load your application here

win.webContents.openDevTools();

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

async function updateTrayIcon(count) {
  console.log("update tray")
  let image = await Jimp.read(path.join(__dirname, '../assets/icons/icons8-wave-22.png'));
  let font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  // console.log(image)
  // console.log(font)
  
  image.print(font, 0, 0, {
    text: count.toString(),
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, image.bitmap.width, image.bitmap.height);
  
image.writeAsync('assets/jimpimage.png').then(() => {
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
}
