// Form helpers
function btnStartLoad(btn) {
  btn.classList.add('has-load');
}

function btnEndLoad(btn) {
  btn.classList.remove('has-load');
}


// TODO: replace this functions to validate.js
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


// Show form errors (validate.js)
function showErrors(errors, fields) {
  for (var i = 0; i < fields.length; i++) {
    showErrorsForInput(fields[i], errors && errors[fields[i].name]);
  }
}

function showErrorsForInput(input, errors) {
  var formField = closestParent(input.parentNode, 'field');

  if (!formField) return;

  //var messages = document.createElement('div');
  //messages.classList.add('field__error');
  //formField.appendChild(messages);

  resetformField(formField);

  if (errors) {
    input.classList.add('has-error');

    errors.forEach(function(error){
      showError(error);
      //addError(messages, error);
    });
  } else {
    input.classList.remove('has-error');
    clearAllMsgs();
  }
}

function closestParent(child, className) {
  if (!child || child == document) {
    return null;
  }

  if (child.classList.contains(className)) {
    return child;
  } else {
    return closestParent(child.parentNode, className);
  }
}

function resetformField(formField) {
  formField.classList.remove('has-error');
  //TODO: remove prev message
}

function addError(messages, error) {
  var block = document.createElement('p');
  block.classList.add('help-block');
  block.classList.add('error');
  block.innerText = error;
  messages.appendChild(block);
}