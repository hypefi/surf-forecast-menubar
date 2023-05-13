const { Menu, Tray, app, BrowserWindow } = require('electron')
const os = require("os");

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







// function createWindow () {
//   let win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       nodeIntegration: true,
//     }
//   })

//   win.loadFile('index.html')
// }

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
    frame: false, // change to true to be able to drag 
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
