const {ipcRenderer} = require('electron')
const windowItems = require('./windowItems')

const bookmarkListEl = document.querySelector('.submenu-container__list--bookmarklet')
const bookmarkItemsColl = bookmarkListEl.children

exports.storage = JSON.parse(localStorage.getItem('bookmarklet-items')) || []

exports.save = () => {
  localStorage.setItem('bookmarklet-items', JSON.stringify(this.storage))
}

exports.delete = itemIndex => {
  this.storage.splice(itemIndex, 1)
  this.save()
  bookmarkItemsColl[itemIndex].remove()
}

exports.addItem = (name, code, isNew = false) => {
  const listContainer = document.querySelector('.submenu-container__list--bookmarklet')
  const itemNode = document.createElement('li')

  itemNode.innerHTML = `
    <button class="btn btn--sm btn--execute-code">
      <span>${name}</span>
    </button>
    <button class="btn btn--sm btn--icon btn--sm-icon btn--delete">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `

  listContainer.appendChild(itemNode)

  const deleteBtn = itemNode.querySelector('.btn--delete')
  const executeCodeBtn = itemNode.querySelector('.btn--execute-code')

  deleteBtn.addEventListener('click', () => {
    const selectedItemIndex = [...bookmarkItemsColl].indexOf(itemNode)

    this.delete(selectedItemIndex)
  })

  executeCodeBtn.addEventListener('click', e => {
    const arrWindowItems = [...windowItems.windowItemsColl]
    const arrSelectedItems = []

    for(itemIndex in arrWindowItems) {
      arrWindowItems[itemIndex].classList.contains('selected') ? arrSelectedItems.push(itemIndex) : false
    }

    ipcRenderer.send('selected-executeCode', arrSelectedItems, code)
  })

  if(isNew) {
    this.storage.push( {name, code} )
    this.save()
  }
}

for(item of this.storage) {
  this.addItem(item.name, item.code)
}