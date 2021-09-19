const {ipcRenderer} = require('electron')
const windowItems = require('./windowItems')

exports.storage = JSON.parse(localStorage.getItem('resizing-items')) || []

exports.save = () => {
  localStorage.setItem('resizing-items', JSON.stringify(this.storage))
}

exports.delete = (resizingList, item, width, height) => {
  const selectedItemIndex = resizingList.indexOf(item)
  resizingList[selectedItemIndex].remove()

  for(let index in this.storage) {
    
    Object.keys(this.storage[index]).forEach(key => {

      switch(key) {
        case 'desktop':
          if(this.storage[index].desktop.width == width) {
            this.storage.splice(index, 1)
            this.save()
          } 
          break
        case 'tablet':
          if(this.storage[index].tablet.width == width && this.storage[index].tablet.height == height) {
            this.storage.splice(index, 1)
            this.save()
          } 
          break
        case 'mobile':
          if(this.storage[index].mobile.width == width && this.storage[index].mobile.height == height) {
            this.storage.splice(index, 1)
            this.save()
          } 
          break
      }
    })
  }
}

exports.addItem = (selectedDevice, width, height, isNew = false) => {
  const resizingListContainer = document.querySelector(`.resizing-list[data-container-${selectedDevice}]`)
  const itemNode = document.createElement('li')

  itemNode.innerHTML = `
    <button class="btn btn--sm btn--resize">
      <span>${width}${height ? ' x ' + height : ''}</span>
    </button>
    <button class="btn btn--sm btn--icon btn--sm-icon btn--delete">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `

  resizingListContainer.appendChild(itemNode)

  const deleteBtn = itemNode.querySelector('.btn--delete')
  const resizeBtn = itemNode.querySelector('.btn--resize')

  deleteBtn.addEventListener('click', () => {
    const resizingList = [...resizingListContainer.children]
    this.delete(resizingList, itemNode, width, height)
  })

  resizeBtn.addEventListener('click', e => {
    const arrWindowItems = [...windowItems.windowItemsColl]
    const arrSelectedItems = []

    for(itemIndex in arrWindowItems) {
      arrWindowItems[itemIndex].classList.contains('selected') ? arrSelectedItems.push(itemIndex) : false
    }

    ipcRenderer.send('selected-items', arrSelectedItems, width, height)
  })

  if(isNew) {

    switch(selectedDevice) {
      case 'desktop':
        this.storage.push( {desktop: {width}} )    
        break
      case 'tablet':
        this.storage.push( {tablet: {width, height}} )
        break
      case 'mobile':
        this.storage.push( {mobile: {width, height}} )
        break
    }
    this.save()
  }
}

for(item of this.storage) {

  if(Object.keys(item)[0] == 'desktop') {
    this.addItem('desktop', item.desktop.width)
  }else if(Object.keys(item)[0] == 'tablet') {
    this.addItem('tablet', item.tablet.width, item.tablet.height)
  }else if(Object.keys(item)[0] == 'mobile') {
    this.addItem('mobile', item.mobile.width, item.mobile.height)
  }
}