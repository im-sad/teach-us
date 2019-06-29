document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function () {
    var editOption = document.getElementById('js-editval');
    var formChangePass = document.getElementById('js-form-pass');

    if (editOption) {
      editValue(editOption);
    }

    if (formChangePass) {
      var formChangePassBtn = formChangePass.getElementsByClassName('btn')[0];

      formChangePass.addEventListener('submit', function(e) {
        e.preventDefault();

        if (formChangePassBtn) {
          btnStartLoad(formChangePassBtn);
        }

        // тут будет AJAX
        setTimeout(function() {
          btnEndLoad(formChangePassBtn);
        }, 3000);
      });
    }


    function editValue(scope) {
      var currentVal = scope.querySelector('[data-val]');
      var edit = scope.getElementsByClassName('js-editval-change')[0];
      var field = scope.getElementsByClassName('js-editval-field')[0];
      var input = field.getElementsByTagName('input')[0];
      var save = field.getElementsByTagName('button')[0];

      edit.addEventListener('click', function() {
        this.classList.add('is-hidden');
        currentVal.classList.add('is-hidden');
        field.classList.remove('is-hidden');
      });

      save.addEventListener('click', function() {
        var newPhone = input.value;
        //TODO: валидация

        btnStartLoad(this);

        // тут будет AJAX
        setTimeout(function() {
          currentVal.textContent = newPhone;
          currentVal.classList.remove('is-hidden');
          edit.classList.remove('is-hidden');
          field.classList.add('is-hidden');
          btnEndLoad(save);
        }, 1000);
      });
    }
  })();
});