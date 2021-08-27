// Module
const {ipcRenderer} = require('electron')
const windowItems = require('./function_modules/windowItems')
const checkFormUrl = require('./function_modules/checkFormUrl')

// Dom nodes
let modal = document.querySelector('.modal'),
    openModalBtn = document.querySelector('.btn--modal-trigger'),
    closeModalBtn = modal.querySelector('.btn--modal-close'),
    urlInput = modal.querySelector('.input--url'),
    addWindowBtn = modal.querySelector('.btn--add-window')

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