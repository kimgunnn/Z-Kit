// Module
const {ipcRenderer} = require('electron')
const windowItems = require('./windowItems')

// Dom nodes
let modal = document.querySelector('.modal'),
    openModalBtn = document.querySelector('.btn--modal-trigger'),
    closeModalBtn = document.querySelector('.btn--modal-close'),
    windowUrl = document.querySelector('.input--url'),
    addWindowBtn = document.querySelector('.btn--add-window')

// Disable & Enable modal button
function toggleModalbuttons() {

  // Check state of buttons
  if(addWindowBtn.disabled == true) {
    addWindowBtn.disabled = false;
    closeModalBtn.disabled = false;
    addWindowBtn.innerText = 'OK'
  } else {
    addWindowBtn.disabled = true;
    closeModalBtn.disabled = true;
    addWindowBtn.innerText = 'Creating...'
  }
}


// Open modal
openModalBtn.addEventListener('click', () => {
  modal.classList.add('modal-open')
  windowUrl.focus()
})

// Close modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('modal-open')
})

// Handle new window
addWindowBtn.addEventListener('click', e => {

  // Check a url exists
  if(windowUrl.value) {

    // Send new window url to main process
    ipcRenderer.send('new-windowItem', windowUrl.value)

    // Disable buttons
    toggleModalbuttons()
  }
})

// Listen for keyboard submit
windowUrl.addEventListener('keyup', e => {

  if(e.key == 'Enter') {
    addWindowBtn.click()
  }
})

// Listen for new window from main process
ipcRenderer.on('new-windowItem-success', (e, windowInfo) => {
  
  // Add new windowItem to "windowItems" node
  windowItems.addItem(windowInfo, true)

  // Enable buttons
  toggleModalbuttons()

  // Hide modal and clear value
  modal.classList.remove('modal-open')
  windowUrl.value = '';
})