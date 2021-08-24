const {app, BrowserWindow, ipcMain} = require('electron')
const windowStateKeeper = require('electron-window-state')
const readWindowItem = require('./readWindowItem')

let mainWindow
let arrSubWindows = []

// Listen for new window request
ipcMain.on('new-windowItem', (e, windowUrl) => {
  
  // Get new window and send back to renderer
  readWindowItem(windowUrl, (windowInstance, windowInfo) => {
    arrSubWindows.push(windowInstance)
    e.sender.send('new-windowItem-success', windowInfo)
  })
})

ipcMain.on('window-items', (e, windowItems) => {
  if(!windowItems.length) {
    return
  }
  windowItems.forEach(item => {
    arrSubWindows.push(readWindowItem(item.url))
  })
})

function createWindow () {

  // Window state keeper
  let state = windowStateKeeper()

  mainWindow = new BrowserWindow({
    x: state.x, y: state.y,
    width: 1050, height: 450,
    resizable: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    },
  })

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('renderer/main.html')

  // Manage new window state
  state.manage(mainWindow)

  // Open DevTools
  // mainWindow.webContents.openDevTools();

  // Send renderer a message when app is active
  mainWindow.webContents.once('did-finish-load', e => {
    e.sender.send('main-window-finish-load')
  })

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    arrSubWindows.forEach(item => {
      item.destroy()
    })
    arrSubWindows = []
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
