document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var passEyeBtns = document.getElementsByClassName('js-pass-eye');

    for (var i = 0; i < passEyeBtns.length; i++) {
      passEyeBtns[i].addEventListener('click', function(e) {
        var field = e.target.parentNode;
        var input = field.getElementsByTagName('input')[0];

        if (!input) return;

        if (input.getAttribute('type') == 'password') {
          field.classList.add('is-pass-show');
          input.setAttribute('type', 'text');
        } else {
          field.classList.remove('is-pass-show');
          input.setAttribute('type', 'password');
        }
      });
    }

  }());
});
