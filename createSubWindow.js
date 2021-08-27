// Modules
const {BrowserWindow} = require('electron')

// Exported createSubWindow function
module.exports = (_url, callback) => {

  const subWindow = new BrowserWindow({
    width: 375,
    height: 695,
    minWidth: 280,
    minHeight: 681,
    show: false
  })

  // Load WindowItem url
  subWindow.loadURL(_url)
  
  subWindow.on('close', e => {
    e.preventDefault()
    subWindow.hide()
    subWindow.webContents.loadURL(_url)
  })

  if(callback) {
    subWindow.webContents.on('did-finish-load', () => {
      const title = subWindow.getTitle()
      const url = subWindow.getURL()
      
      if(_url === url) {
        callback(subWindow, {title, url})
      }
    })
  } else {
    return subWindow
  }
}