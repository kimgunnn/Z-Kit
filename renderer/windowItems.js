// DOM nodes
let windowList = document.querySelector('.window-list')

// Track windowItems in storage
exports.storage = JSON.parse(localStorage.getItem('window-items')) || []

// Persist storage
exports.save = () => {
  localStorage.setItem('window-items', JSON.stringify(this.storage))
}

// Add new WindowItem
exports.addItem = (item, isNew = false) => {

  // Create a new DOM node
  let itemNode = document.createElement('li')

  // Add inner HTML
  itemNode.innerHTML = `
    <div class="window-item-box">
      <strong>${item.title}</strong>
      <p><span>${item.url}</span></p>
      <div class="icon-box">
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