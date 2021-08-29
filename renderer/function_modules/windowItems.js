// Module
const {ipcRenderer} = require('electron')

// DOM nodes
let windowList = document.querySelector('.window-list')

// Track windowItems in storage
exports.storage = JSON.parse(localStorage.getItem('window-items')) || []

// Persist storage
exports.save = () => {
  localStorage.setItem('window-items', JSON.stringify(this.storage))
}

// Set item as selected
exports.select = e => {

  if( e.target.parentNode.classList.contains('icon-checkmark') ) {
    e.currentTarget.classList.toggle('selected')
  }
}

exports.toggleBtn = e => {

  if( e.target.parentNode.classList.contains('icon-plus') ) {
    e.target.parentNode.classList.toggle('active')
  }
}

exports.subWindowOpen = e => {
  const arr = [...windowList.children]
  const itemId = arr.indexOf(e.currentTarget)
  ipcRenderer.send('selected-item-id', itemId)
}

// Add new WindowItem
exports.addItem = (item, isNew = false) => {

  // Create a new DOM node
  let itemNode = document.createElement('li')

  // Add inner HTML
  itemNode.innerHTML = `
    <div class="window-item-box">
      <strong title="${item.title}">${item.title}</strong>
      <p><span title="${item.url}">${item.url}</span></p>
      <div class="icon-area">
        <div class="icon-box">
          <button class="icon icon-check">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <button class="icon icon-delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <label class="btn-toggle">
          <input type="checkbox" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-power"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
        </label>
      </div>
    </div>
  `

  // Append new node to "windowList"
  windowList.appendChild(itemNode)

  // Attach click handler to select
  itemNode.addEventListener('click', e => {
    this.select(e)
  })

  itemNode.addEventListener('click', e => {
    this.toggleBtn(e)
  })

  itemNode.addEventListener('dblclick', e => {
    this.subWindowOpen(e)
  })

  // Add window item to storage and persist
  if(isNew) {
    this.storage.push(item)
    this.save()
  }
}

// Add window item from storage when app loads
this.storage.forEach( item => {
  this.addItem(item)
})

ipcRenderer.on('main-window-ready', () => {
  ipcRenderer.send('window-items', this.storage)
})