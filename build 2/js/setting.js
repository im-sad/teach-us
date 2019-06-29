document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
    var editOption = document.getElementById('js-editval');

    if (editOption) {
      console.log(editOption);
      editValue(editOption);
    }

    function editValue(scope) {
      var current = scope.querySelector('[data-val]');
      var edit = scope.getElementsByClassName('js-editval-change')[0];
      var field = scope.getElementsByClassName('js-editval-field')[0];
      var input = field.getElementsByTagName('input')[0];
      var save = field.getElementsByTagName('button')[0];

      edit.addEventListener('click', function() {
        this.classList.add('is-hidden');
        current.classList.add('is-hidden');
        field.classList.remove('is-hidden');
      });

      save.addEventListener('click', function() {
        var newPhone = input.value;

        this.classList.add('has-load');

        setTimeout(function() {
          current.textContent = newPhone;
          current.classList.remove('is-hidden');
          edit.remove('is-hidden');
          field.classList.add('is-hidden');
        }, 1000);
      });
    }

  })();
});