// Disable & Enable form elements
exports.toggleFormElements = (submitBtn, ...formEl) => {

  // Check state
  if(submitBtn.disabled == false) {
    submitBtn.disabled = true
    submitBtn.firstChild.innerText = 'Creating...'

    formEl.forEach(item => {
      item.disabled = true;
    })
  } else {
    submitBtn.disabled = false;
    submitBtn.firstChild.innerText = 'OK';

    formEl.forEach(item => {
      item.disabled = false;
    })
  }
}