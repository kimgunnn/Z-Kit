// Module
const {ipcRenderer} = require('electron')
const windowItems = require('./function_modules/windowItems')
const resizingItems = require('./function_modules/resizingItems')
const checkFormUrl = require('./function_modules/checkFormUrl')

// Dom nodes
const modal = document.querySelector('.modal')
const openModalBtn = document.querySelector('.btn--modal-trigger')
const closeModalBtn = modal.querySelector('.btn--modal-close')
const urlInput = modal.querySelector('.input--url')
const addWindowBtn = modal.querySelector('.btn--add-window')

// Open modal
openModalBtn.addEventListener('click', () => {
  modal.classList.add('modal-open')
  urlInput.focus()
})

// Close modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('modal-open')
})

// Handle new window
addWindowBtn.addEventListener('click', () => {

  // Check a url exists
  if(urlInput.value) {

    // Send new window url to main process
    ipcRenderer.send('new-windowItem', urlInput.value)

    // Disable buttons
    checkFormUrl.toggleFormElements(addWindowBtn, urlInput, closeModalBtn)
  }
})

// Listen for keyboard submit
urlInput.addEventListener('keyup', e => {
  
  if(e.key == 'Enter') {
    addWindowBtn.click()
  }
})

// Listen for new window from main process
ipcRenderer.on('new-windowItem-success', (e, windowInfo) => {
  
  if(windowInfo) {

    // Add new windowItem to "windowItems" node
    windowItems.addItem(windowInfo, true)

    // Enable buttons
    checkFormUrl.toggleFormElements(addWindowBtn, urlInput, closeModalBtn)

    // Hide modal and clear value
    modal.classList.remove('modal-open')
    urlInput.value = '';
  } else {
    alert('Failed to create!')

    checkFormUrl.toggleFormElements(addWindowBtn, urlInput, closeModalBtn)
    urlInput.focus()
  }
})

const gnbItemResizingBtn = document.querySelector('.gnb__item--resizing > .btn')
const resizingMenuContainer = document.querySelector('.submenu-container--resizing')
const deviceSelect = resizingMenuContainer.querySelector('.select--device')
const widthInput = resizingMenuContainer.querySelector('.input--width')
const heightInput = resizingMenuContainer.querySelector('.input--height')
const addSizeBtn = resizingMenuContainer.querySelector('.btn--add-size')

gnbItemResizingBtn.addEventListener('click', e => {
  resizingMenuContainer.classList.toggle('modal-open')
})

if(deviceSelect.value.toLowerCase() == 'desktop') {
  heightInput.type = 'text'
  heightInput.value = 'Full Height'
  heightInput.disabled = true
}

deviceSelect.addEventListener('change', e => {
  widthInput.focus()

  if(e.target.value.toLowerCase() == 'desktop') {
    heightInput.type = 'text'
    heightInput.value = 'Full Height'
    heightInput.disabled = true
  } else {
    heightInput.type = 'number'
    heightInput.value = ''
    heightInput.disabled = false
  }
})

addSizeBtn.addEventListener('click', () => {
  const device = deviceSelect.value.toLowerCase()
  
  if(widthInput.value && heightInput.value) {

    if(device == 'desktop') {
      resizingItems.addItem(device, widthInput.value, '', true)
      widthInput.value = ''
    } else {
      resizingItems.addItem(device, widthInput.value, heightInput.value, true)
      widthInput.value = ''
      heightInput.value = ''
    }
    widthInput.focus()
  }
})