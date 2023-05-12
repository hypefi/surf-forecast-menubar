const { Menu, Tray, app, BrowserWindow } = require('electron')
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
      backgroundThrottling: false
    }
  })
win.loadFile('../app/view/index.html') // Load your application here

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
