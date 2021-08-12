// Dom nodes
let modal = document.querySelector('.modal'),
    openModalBtn = document.querySelector('.btn--modal-trigger'),
    closeModalBtn = document.querySelector('.btn--modal-close'),
    windowUrl = document.querySelector('.input--url')

// Open modal
openModalBtn.addEventListener('click', () => {
  modal.classList.add('modal-open')
  windowUrl.focus()
})

// Close modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('modal-open')
})