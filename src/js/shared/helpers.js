// Form helpers
function btnStartLoad(btn) {
  if (!btn) return;

  btn.classList.add('has-load');
}

function btnEndLoad(btn) {
  if (!btn) return;

  btn.classList.remove('has-load');
}

// Show form errors (validate.js)
function showValidateErrors(errors, fields) {
  var fieldsLength = fields.length;

  if (fieldsLength > 0) clearAllMsgs();

  for (var i = 0; i < fieldsLength; i++) {
    showErrorsForInput(fields[i], errors && errors[fields[i].name]);
  }
}

function showErrorsForInput(input, errors) {
  var formField = closestParent(input.parentNode, 'field')
                  || closestParent(input.parentNode, 'checkbox')
                  || closestParent(input.parentNode, 'radio');

  if (!formField) return;

  resetformField(formField);

  if (errors) {
    formField.classList.add('has-error');
    input.classList.add('has-error');

    errors.forEach(function(error) {
      showError(error);
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
}