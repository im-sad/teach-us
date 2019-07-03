document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
    var signForm = document.getElementById('js-signin-form');

    if (signForm) {
      signForm.addEventListener('submit', function(e) {
        e.preventDefault();
        this.disableValidation = true;

        var inputsList = signForm.getElementsByTagName('input');

        formValidate(inputsList);

        if (isFormValid(this)) {
          var submitBtn = this.getElementsByTagName('button')[0];

          submitBtn.classList.add('has-load');

          var formData = getFormData(inputsList);
          sendData(formData , submitBtn);
        }
      });


      // Functions
      function getFormData(items) {
        var data = {};
        
        for (var k = 0; k < items.length; k++) {
          var name = items[k].name;
          var type = items[k].type;

          if (type === 'checkbox' && !items[k].checked) {
            continue;
          } else {
            data[name] = items[k].value;
          }
        }

        return data;
      }

      function isFormValid(form) {
        if (form.getElementsByClassName('has-error').length < 1) return true;
      }

      function formValidate(items) {
        if (!items) return;

        for (var i = 0; i < items.length; i++) {
          validateInput(items[i]);
        }
      }


      function validateInput(input) {
        if (!input) return;

        var inputType = input.getAttribute('type');

        switch (inputType) {
          case 'email':
            if (isFieldEmpty(input) && isFieldRequired(input)) {
              fieldAddError(input);
            } else if (!isEmailValid(input)) {
              fieldAddError(input);
              showError('Wrong email format');
            } else {
              fieldRemoveError(input);
            }

            break;

          default:
            if (isFieldEmpty(input) && isFieldRequired(input)) {
              fieldAddError(input);
            } else {
              fieldRemoveError(input);
            }

            break;
        }
      }


      function sendData(data, btn) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
        xmlhttp.send(JSON.stringify(data));

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState !== 4) return;

          if (xmlhttp.status === 200 || xmlhttp.status === 201) {
            // good
          } else {
            // not good
          }

          btn.classList.remove('has-load');
        }
      }
    }
  })();
});
