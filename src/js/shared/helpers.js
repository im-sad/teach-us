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

function showError(msg) {
  if (!msg) return;

  return iziToast.show({
    message: msg,
    color: 'red',
    theme: 'dark',
    position: 'topCenter',
    timeout: false,
    progressBar: false,
    animateInside: false,
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutUp',
    displayMode: 'replace'
  });
}

function showWarning(msg) {
  if (!msg) return;

  return iziToast.show({
    message: msg,
    color: 'yellow',
    position: 'topCenter',
    timeout: 1800,
    progressBar: false,
    close: false,
    animateInside: false,
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutUp'
  });
}

function showSuccsess(msg) {
  if (!msg) return;

  return iziToast.show({
    message: msg,
    color: 'green',
    position: 'topCenter',
    timeout: 1800,
    progressBar: false,
    close: false,
    animateInside: false,
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutUp'
  });
}

function clearAllMsgs() {
  //iziToast.destroy();
  var toasts = document.getElementsByClassName('iziToast-opened');

  for (var i = 0; i < toasts.length; i++) {
    iziToast.hide({
      transitionOut: 'fadeOutUp'
    }, toasts[i]);
  }
}

var reachGoal = {
  all: function(goalName, method, params) {
    this.yandex(goalName, method, params);
    this.google(goalName);
    this.fb(goalName);
  },
  yandex: function(goalName, method, params) {
    method = method || 'reachGoal';

    if (window.ym) {
      ym('54538828', method, goalName, params);
    }
  },
  google: function(goalName) {
    if (window.gtag) gtag('event', goalName, {'method': 'Empty'});
  },
  fb: function(goalName) {
    if (window.fbq) fbq('trackCustom', goalName);
  }
};