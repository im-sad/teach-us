document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
    var baseTabs = document.getElementsByClassName('js-tabs')[0];

    if (baseTabs) new Tabs(baseTabs);
  })();
});


var notyWarn = notus({
  title: '',
  closable: false,
  autoCloseDuration: 5000,
  notusType: 'toast',
  notusPosition: 'top',
  alertType: 'warning',
  htmlString: true
});

var notyError = notus({
  title: '',
  closable: true,
  autoClose: false,
  notusType: 'toast',
  notusPosition: 'top',
  alertType: 'failure',
  htmlString: true
});
