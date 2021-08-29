const {app, BrowserWindow, ipcMain} = require('electron')
const windowStateKeeper = require('electron-window-state')
const createSubWindow = require('./createSubWindow')

let mainWindow
let arrSubWindows = []

// Listen for new window request
ipcMain.on('new-windowItem', (e, windowUrl) => {

  for(item of arrSubWindows) {
    if(item.getURL() === windowUrl) {
      e.sender.send('new-windowItem-success', false)
      return
    }
  }

  // Get new window and send back to renderer
  createSubWindow(windowUrl, (windowInstance, windowInfo) => {
    
    for(item of arrSubWindows) {
      if(item.getURL() === windowInfo.url) {
        return
      }
    }
    arrSubWindows.push(windowInstance)
    e.sender.send('new-windowItem-success', windowInfo)
  })
})

ipcMain.on('window-items', (e, windowItems) => {
  windowItems.forEach(item => {
    arrSubWindows.push(createSubWindow(item.url))
  })
})

ipcMain.on('selected-item-id', (e, windowId) => {
  arrSubWindows[windowId].show()
})

function createWindow () {

  // Window state keeper
  let state = windowStateKeeper()

  mainWindow = new BrowserWindow({
    x: state.x, y: state.y,
    width: 1230, height: 463,
    resizable: false,
    show: false,
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
  mainWindow.webContents.on('did-finish-load', e => {
    mainWindow.show()
    e.sender.send('main-window-ready')
  })

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    if(arrSubWindows.length) {
      arrSubWindows.forEach(item => {
        item.destroy()
      })
      arrSubWindows = []
    }
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
