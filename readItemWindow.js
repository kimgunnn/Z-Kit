// Modules
const {BrowserWindow} = require('electron')

// Offscreen BrowserWindow
let offscreenWindow

// Exported readItemWindow function
module.exports = (url, callback) => {

  // Create offscreen window
  offscreenWindow = new BrowserWindow({
    width: 500,
    height: 500,
    show: false,
    webPreferences: {
      offscreen: true
    }
  })

  // Load itemWindow url
  offscreenWindow.loadURL(url)

  // Wait for content to finish loading
  offscreenWindow.webContents.on('did-finish-load', e => {

    // Get page title
    let title = offscreenWindow.getTitle()

    // Execute callback with new itemWindow object
    callback( {title, url} )

    // Clean up
    offscreenWindow.close()
    offscreenWindow = null
  })
}