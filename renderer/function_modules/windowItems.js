// Module
const {ipcRenderer} = require('electron')

// DOM nodes
let windowListEl = document.querySelector('.window-list')
exports.windowItemsColl = windowListEl.children

// Track window items in storage
exports.storage = JSON.parse(localStorage.getItem('window-items')) || []

// Persist storage
exports.save = () => {
  localStorage.setItem('window-items', JSON.stringify(this.storage))
}

exports.delete = itemIndex => {
  ipcRenderer.send('remove-item', itemIndex)
  this.storage.splice(itemIndex, 1)
  this.save()
  this.windowItemsColl[itemIndex].remove()
}

exports.openSubWindow = itemIndex => {
  ipcRenderer.send('open-subWindow', itemIndex)
}

// Add new WindowItem
exports.addItem = (item, isNew = false) => {

  // Create a new DOM node
  let itemNode = document.createElement('li')

  // Add inner HTML
  itemNode.innerHTML = `
    <div class="window-item-box">
      <strong title="${item.title}" class="ellipsis">${item.title}</strong>
      <p><span title="${item.url}" class="ellipsis">${item.url}</span></p>
      <div class="btn-area">
        <div class="btn-box">
          <button class="btn btn--sm btn--icon btn--sm-icon btn--check">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <button class="btn btn--sm btn--icon btn--sm-icon btn--delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <button class="btn btn--sm btn--icon btn--sm-icon btn--toggle" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-power"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
        </button>
      </div>
    </div>
  `

  // Append new node to "windowListEl"
  windowListEl.appendChild(itemNode)

  // Attach click handler to select
  const checkBtn = itemNode.querySelector('.btn--check')
  const deleteBtn = itemNode.querySelector('.btn--delete')

  checkBtn.addEventListener('click', e => {
    itemNode.classList.toggle('selected')
  })

  deleteBtn.addEventListener('click', e => {
    const selectedItemIndex = [...this.windowItemsColl].indexOf(itemNode)

    this.delete(selectedItemIndex)
  })

  itemNode.addEventListener('dblclick', e => {
    const selectedItemIndex = [...this.windowItemsColl].indexOf(itemNode)

    this.openSubWindow(selectedItemIndex)
  })

  // Add window item to storage and persist
  if(isNew) {
    this.storage.push(item)
    this.save()
  }
}

// Add window item from storage when app loads
this.storage.forEach(item => {
  this.addItem(item)
})

ipcRenderer.on('main-window-ready', () => {
  ipcRenderer.send('window-items', this.storage)
})

ipcRenderer.on('show-subWindow', (e, windowInfo) => {
  let itemIndex

  for(let item in this.storage) {
    if( JSON.stringify(this.storage[item]) == JSON.stringify(windowInfo) ) {
      itemIndex = item
      break
    }
  }
  this.windowItemsColl[itemIndex].classList.add('active')
})

ipcRenderer.on('hide-subWindow', (e, windowInfo) => {
  let itemIndex

  for(let item in this.storage) {
    if( JSON.stringify(this.storage[item]) == JSON.stringify(windowInfo) ) {
      itemIndex = item
      break
    }
  }
  this.windowItemsColl[itemIndex].classList.remove('active')
})