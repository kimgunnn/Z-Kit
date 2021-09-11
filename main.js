const {app, BrowserWindow, ipcMain} = require('electron')
const windowStateKeeper = require('electron-window-state')

let mainWindow
let arrSubWindows = []

// Listen for new window item request
ipcMain.on('new-windowItem', (e, windowUrl) => {

  for(item of arrSubWindows) {
    if(item.getURL() === windowUrl) {
      e.sender.send('new-windowItem-success', false)
      return
    }
  }

  // Get new window item and send back to renderer
  createSubWindow(windowUrl, (windowInstance, windowInfo) => {
    
    arrSubWindows.push(windowInstance)
    e.sender.send('new-windowItem-success', windowInfo)
  }, true)
})

ipcMain.on('window-items', (e, windowItems) => {
  
  for(let item of arrSubWindows) {
    if(item.getURL() === windowItems[0].url) {
      return
    }
  }

  for(let item of windowItems) {
    createSubWindow(item.url, (windowInstance) => {
      arrSubWindows.push(windowInstance)
    })
  }

  for(let item of arrSubWindows) {
    item.webContents.on('did-finish-load', () => {
      const title = item.getTitle()
      const url = item.getURL()

      item.on('show', () => {
        mainWindow.webContents.send('show-subWindow', {title, url})
      })
    
      item.on('hide', () => {
        mainWindow.webContents.send('hide-subWindow', {title, url})
      })
    })
  }
})

ipcMain.on('open-subWindow', (e, windowIndex) => {
  try {
    arrSubWindows[windowIndex].show()
  } catch {
    return
  }
})

ipcMain.on('remove-item', (e, windowIndex) => {
  arrSubWindows[windowIndex].destroy()
  arrSubWindows.splice(windowIndex, 1)
})

function createMainWindow() {

  // Window state keeper
  const state = windowStateKeeper()

  mainWindow = new BrowserWindow({
    x: state.x, y: state.y,
    width: 1230, height: 473,
    resizable: false,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    },
  })

  // Load main.html into the main BrowserWindow
  mainWindow.loadFile('renderer/main.html')

  // Manage main window state
  state.manage(mainWindow)

  // Open DevTools
  // mainWindow.webContents.openDevTools();

  // Send renderer a message when app is active
  mainWindow.webContents.on('did-finish-load', e => {
    mainWindow.show()

    for(let item of arrSubWindows) {
      item.hide()
    }
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

function createSubWindow(_url, callback, isInitial = false) {

  const subWindow = new BrowserWindow({
    width: 375,
    height: 695,
    minWidth: 280,
    minHeight: 681,
    show: false
  })

  subWindow.loadURL(_url)
  
  subWindow.on('close', e => {
    e.preventDefault()
    subWindow.hide()
    subWindow.webContents.loadURL(_url)
  })

  if(isInitial) {
    subWindow.webContents.once('did-finish-load', () => {
      const title = subWindow.getTitle()
      const url = subWindow.getURL()

      callback(subWindow, {title, url})
  
      subWindow.on('show', () => {
        mainWindow.webContents.send('show-subWindow', {title, url})
      })
    
      subWindow.on('hide', () => {
        mainWindow.webContents.send('hide-subWindow', {title, url})
      })
    })
  } else {
    callback(subWindow)
  }
}

// Create a new BrowserWindow when `app` is ready
app.on('ready', createMainWindow)

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createMainWindow()
})
