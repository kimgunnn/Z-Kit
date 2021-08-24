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
  const itemUrl = this.storage[itemId].url
  ipcRenderer.send('selected-item-id', itemId, itemUrl)
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
      <div class="icon-box">
        <div class="icon icon-plus">
          <img src="./images/icon_plus.png" alt="">
        </div>
        <div class="icon icon-checkmark">
          <img src="./images/icon_checkmark.png" alt="">
        </div>
        <div class="icon icon-delete">
          <img src="./images/icon_delete.png" alt="">
        </div>
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

ipcRenderer.on('main-window-finish-load', () => {
  ipcRenderer.send('window-items', this.storage)
})