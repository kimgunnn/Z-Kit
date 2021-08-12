// DOM nodes
let windowList = document.querySelector('.window-list')

// Add new Window
exports.addItem = item => {

  // Create a new DOM node
  let itemNode = document.createElement('li')

  // Add inner HTML
  itemNode.innerHTML = `
    <div class="window-item-box">
      <strong>${item.title}</strong>
      <p><span>${item.url}</span></p>
      <div class="icon icon-checkmark">
        <img src="./images/icon_checkmark.png" alt="">
      </div>
    </div>
  `

  // Append new node to "windowList"
  windowList.appendChild(itemNode)
}