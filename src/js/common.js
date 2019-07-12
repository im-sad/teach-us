// Form helpers
function btnStartLoad(btn) {
  btn.classList.add('has-load');
}

function btnEndLoad(btn) {
  btn.classList.remove('has-load');
}

// Show form errors (validate.js)
function showErrors(errors, fields) {
  for (var i = 0; i < fields.length; i++) {
    showErrorsForInput(fields[i], errors && errors[fields[i].name]);
  }
}

function showErrorsForInput(input, errors) {
  var formField = closestParent(input.parentNode, 'field')
                  || closestParent(input.parentNode, 'checkbox')
                  || closestParent(input.parentNode, 'radio');

  if (!formField) return;

  //var messages = document.createElement('div');
  //messages.classList.add('field__error');
  //formField.appendChild(messages);

  resetformField(formField);

  if (errors) {
    formField.classList.add('has-error');
    input.classList.add('has-error');

    errors.forEach(function(error) {
      showError(error);
      //addError(messages, error);
    });
  } else {
    formField.classList.remove('has-error');
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