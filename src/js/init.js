document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
    var baseTabs = document.getElementsByClassName('js-tabs')[0];

    if (baseTabs) new Tabs(baseTabs);
  })();
});