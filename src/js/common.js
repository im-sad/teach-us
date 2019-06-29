// Form helpers
function btnStartLoad(btn) {
  btn.classList.add('has-load');
}

function btnEndLoad(btn) {
  btn.classList.remove('has-load');
}

function fieldAddError(field) {
  field.classList.add('has-error');
  field.parentNode.classList.add('has-error');
}

function fieldRemoveError(field) {
  field.classList.remove('has-error');
  field.parentNode.classList.remove('has-error');
}

function isEmailValid(input) {
  var mailRegex = /^([a-z0-9_\.\+-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/i;

  return mailRegex.test(input.value);
}

function isFieldRequired(field) {
  if (field.attributes['required']) return true;
  else return false;
}

function isFieldEmpty(field) {
  if (field.value === '') return true;
  else return false;
}