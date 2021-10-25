const {app, BrowserWindow, ipcMain} = require('electron')
const windowStateKeeper = require('electron-window-state')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let mainWindow, scrollSyncWindow
let arrSubWindows = []

// Listen for new window item request
ipcMain.on('new-windowItem', (e, windowUrl) => {

  // Get new window item and send back to renderer
  createSubWindow(windowUrl, (windowInstance, windowInfo) => {
        
    if(windowInstance) {
      
      for(let item of arrSubWindows) {
        if(item.getURL() === windowInfo.url) {
          e.sender.send('new-windowItem-success', false)
          windowInstance.destroy()
          return
        }
      }
      
      arrSubWindows.push(windowInstance)
      e.sender.send('new-windowItem-success', windowInfo)
    } else {
      e.sender.send('new-windowItem-success', false)
    }
  }, true)
})

ipcMain.on('window-items', (e, windowItems) => {

  for(let item of windowItems) {
    createSubWindow(item.url, (windowInstance) => {
      arrSubWindows.push(windowInstance)
    })
  }

  for(let item of arrSubWindows) {
    item.webContents.once('did-finish-load', () => {
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

ipcMain.on('remove-subWindow', (e, windowIndex) => {
  arrSubWindows[windowIndex].destroy()
  arrSubWindows.splice(windowIndex, 1)
})

ipcMain.on('selected-subWindow', (e, arrIndex, width, height) => {

  for(item of arrIndex) {
    if(+height) {
      arrSubWindows[item].setBounds({width: +width, height: +height})
    } else {
      arrSubWindows[item].setBounds({width: +width})
    }
    arrSubWindows[item].show()
  }
})

ipcMain.on('scroll-sync', (e, arrIndex) => {

  for(let item of arrIndex) {
    arrSubWindows[item].show()
  }
  scrollSyncWindow.show()
  
  ipcMain.on('wheel-up', (e, wheelDelta) => {
    
    for(let item of arrIndex) {
      arrSubWindows[item].webContents.executeJavaScript(`

        if(window.pageYOffset < document.body.offsetHeight) {
          window.scrollTo(0, window.pageYOffset+${+wheelDelta})
        }
      `)
    }
  })

  ipcMain.on('wheel-down', (e, wheelDelta) => {
    
    for(let item of arrIndex) {
      arrSubWindows[item].webContents.executeJavaScript(`

        if(window.pageYOffset > 0) {
          window.scrollTo(0, window.pageYOffset-${-wheelDelta})
        }
      `)
    }
  })
})

ipcMain.on('selected-executeCode', (e, arrIndex, code) => {

  for(item of arrIndex) {
    arrSubWindows[item].webContents.loadURL(code)
    arrSubWindows[item].show()
  }
})

function createMainWindow() {

  // Window state keeper
  const state = windowStateKeeper()

  mainWindow = new BrowserWindow({
    x: state.x, y: state.y,
    width: 1050, height: 473,
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

  // Send renderer a message when app is active
  mainWindow.webContents.on('did-finish-load', e => {
    mainWindow.show()

    for(let item of arrSubWindows) {
      item.hide()
    }
  })
  
  mainWindow.webContents.once('dom-ready', e => {
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
    scrollSyncWindow.destroy()
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
  
  subWindow.loadURL(_url).then().catch(() => {
    callback(false)
    subWindow.destroy()
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
  
  subWindow.on('close', e => {
    e.preventDefault()
    subWindow.hide()
    subWindow.webContents.loadURL(_url)
  })
}

function createScrollSyncWindow() {

  scrollSyncWindow = new BrowserWindow({
    width: 200, height: 228,
    resizable: false,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  scrollSyncWindow.loadFile('renderer/scrollsync.html')

  scrollSyncWindow.on('show', () => {
    mainWindow.hide()
  })
  
  scrollSyncWindow.on('hide', () => {
    mainWindow.show()
  })

  scrollSyncWindow.on('close',  e => {
    e.preventDefault()
    scrollSyncWindow.hide()
    ipcMain.removeAllListeners('wheel-up')
    ipcMain.removeAllListeners('wheel-down')
  })
}

// Create a new BrowserWindow when `app` is ready
app.on('ready', () => {
  createMainWindow()
  createScrollSyncWindow()
})

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {

  if(mainWindow === null) {
    createMainWindow()
    createScrollSyncWindow()
  }
})
