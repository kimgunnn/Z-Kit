const {app, BrowserWindow} = require('electron')

let mainWindow

function createWindow () {

  mainWindow = new BrowserWindow({
    x: 0, y: 0,
    width: 1050, height: 450,
    resizable: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    },
  })

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('renderer/main.html')

  // Open DevTools
  // mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })
}

// Create a new BrowserWindow when `app` is ready
app.on('ready', createWindow)

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
