// Modules
const {BrowserWindow} = require('electron')

// Exported readWindowItem function
module.exports = (url, callback) => {

  // sub BrowserWindow
  let subWindow

  // Create sub window
  subWindow = new BrowserWindow({
    width: 375,
    height: 695,
    minWidth: 280,
    minHeight: 681,
    show: false
  })

  // Load WindowItem url
  subWindow.loadURL(url)
  
  subWindow.on('close', e => {
    e.preventDefault()
    subWindow.hide()
  })

  if(callback) {

    subWindow.webContents.on('did-finish-load', e => {
      let title = subWindow.getTitle()
      callback( {subWindow, title, url} )
    })
  } else {
    return subWindow
  }
}