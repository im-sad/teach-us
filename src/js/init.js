document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Tabs
  (function() {
    var baseTabs = document.getElementsByClassName('js-tabs')[0];

    if (baseTabs) new Tabs(baseTabs);
  })();


  // Modals
  (function() {
    initBaseModals();

    function initBaseModals() {
      
      var modals = document.getElementsByClassName('js-modal');
      for (var i = 0; i < modals.length; i++) {
        initModal(modals[i]);
      }
    }

    function initModal(modalElement) {
      var modalPlugin = new Modal(modalElement);
      var modalId =  modalElement.getAttribute('id');

      addButtonsEvent(modalPlugin);

      return modalPlugin;

      function addButtonsEvent(obj) {
        var modalBtns = document.querySelectorAll('[data-modal="'+ modalId +'"]');

        for (var j = 0; j < modalBtns.length; j++) {
          modalBtns[j].addEventListener('click', function() {
            obj.open();
            }, false);
        }
      }
    }
  })();
});

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

function clearAllMsgs() {
  //iziToast.destroy();
  var toasts = document.getElementsByClassName('iziToast-opened');

  for (var i = 0; i < toasts.length; i++) {
    iziToast.hide({
      transitionOut: 'fadeOutUp'
    }, toasts[i]);
  }
}