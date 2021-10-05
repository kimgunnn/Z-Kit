// Module
const {ipcRenderer} = require('electron')
const windowItems = require('./function_modules/windowItems')
const resizingItems = require('./function_modules/resizingItems')
const bookmarkletItems = require('./function_modules/bookmarkletItems')
const checkFormUrl = require('./function_modules/checkFormUrl')

// Dom nodes
const modal = document.querySelector('.modal')
const openModalBtn = document.querySelector('.btn--trigger-modal')
const closeModalBtn = modal.querySelector('.btn--close-modal')
const urlInput = modal.querySelector('.input--url')
const addWindowBtn = modal.querySelector('.btn--add-window')
const loaderContainer = document.querySelector('.loader')

// Open modal
openModalBtn.addEventListener('click', () => {
  modal.classList.add('open-modal')
  document.body.style.overflow = 'hidden'
  urlInput.focus()
})

// Close modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('open-modal')
    document.body.style.overflow = 'visible'
})

// Handle new window
addWindowBtn.addEventListener('click', () => {

  // Check a url exists
  if(urlInput.value) {

    // Send new window url to main process
    ipcRenderer.send('new-windowItem', urlInput.value)

    // Disable buttons
    checkFormUrl.toggleFormElements(addWindowBtn, urlInput, closeModalBtn)

    loaderContainer.style.display = 'flex'
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
    modal.classList.remove('open-modal')
    urlInput.value = '';
  } else {
    alert('Failed to create!')

    checkFormUrl.toggleFormElements(addWindowBtn, urlInput, closeModalBtn)
    urlInput.focus()
  }

  loaderContainer.style.display = 'none'
  document.body.style.overflow = 'visible'
})

const arrGnbItems = document.querySelectorAll('.btn[data-gnb-btn]')
const deviceSelect = document.querySelector('.select--device')
const widthInput = document.querySelector('.input--width')
const heightInput = document.querySelector('.input--height')
const addSizeBtn = document.querySelector('.btn--add-size')

arrGnbItems.forEach(item => {

  item.addEventListener('click', e => {
    const itemKeyValue = e.currentTarget.dataset.gnbBtn
    item.nextElementSibling.classList.toggle('open')
  })
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

const scrollSyncBtn = document.querySelector('.gnb__item--scroll-sync')

scrollSyncBtn.addEventListener('click', () => {
  const arrWindowItems = [...windowItems.windowItemsColl]
  const arrSelectedItems = []

  for(itemIndex in arrWindowItems) {
    arrWindowItems[itemIndex].classList.contains('selected') ? arrSelectedItems.push(itemIndex) : false
  }
  ipcRenderer.send('scroll-sync', arrSelectedItems)
})

const nameInput = document.querySelector('.input--name')
const codeInput = document.querySelector('.input--code')
const addBookmarkBtn = document.querySelector('.btn--add-bookmark')

addBookmarkBtn.addEventListener('click', () => {
  
  bookmarkletItems.addItem(nameInput.value, codeInput.value, true)
  nameInput.value = ''
  codeInput.value = ''
  nameInput.focus()
})