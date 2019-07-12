document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function () {
    var editOption = document.getElementById('js-editval');
    var formChangePass = document.getElementById('js-form-pass');
    var constraintsPass = {
      current_password: {
        presence: true,
        length: {
          minimum: 8
        }
      },
      password: {
        presence: true,
        equality: {
          attribute: "password",
          message: "^The passwords does not match"
        }
      }
    };
    var constraintsPhone = {
      phone: {
        presence: true,
        length: {
          minimum: 6,
          maximum: 20
        },
        format: {
          pattern: /^[+]*[\s0-9]{0,4}[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\.0-9]*$/,
          message: "is not a phone number"
        }
      }
    };

    // Change phone
    if (editOption) {
      editValue(editOption);
    }

    // Change pass
    if (formChangePass) {
      var formChangePassBtn = formChangePass.getElementsByClassName('btn')[0];

      formChangePass.addEventListener('submit', function(e) {
        e.preventDefault();

        var that = this;
        var formErrors = validate(that, constraintsPass);
        var formFields = that.querySelectorAll('input[name]');

        showErrors(formErrors || {}, formFields);

        if (!formErrors && formChangePassBtn) {
          var passData = createDataObj(formFields);

          btnStartLoad(formChangePassBtn);

          saveSettings('/users/registrations/set_password', passData, function(status, errors) {
            btnEndLoad(formChangePassBtn);

            if (status) {
              showWarning('Password changed');
            } else {
              var errorText = 'Something went wrong'

              if (errors.current_password.filter((obj) => obj.predicate == 'is_wrong').length > 0) {
                errorText = 'Current password is wrong'
              }

              showError(errorText);
            }
          });
        }
      });
    }


    function editValue(scope) {
      if (!scope) return;

      var currentVal = scope.querySelector('[data-val]');
      var edit = scope.getElementsByClassName('js-editval-change')[0];
      var field = scope.getElementsByClassName('js-editval-field')[0];
      var inputs = field.getElementsByTagName('input');
      var saveBtn = field.getElementsByTagName('button')[0];

      edit.addEventListener('click', function() {
        this.classList.add('is-hidden');
        currentVal.classList.add('is-hidden');
        field.classList.remove('is-hidden');
      });

      scope.addEventListener('submit', function(e) {
        e.preventDefault();

        var phoneErrors = validate(this, constraintsPhone);
        showErrors(phoneErrors || {}, this);

        if (!phoneErrors) {
          var phoneData = createDataObj(inputs);

          btnStartLoad(saveBtn);

          saveSettings('/users/registrations/set_phone', phoneData, function(status) {
            btnEndLoad(saveBtn);
            currentVal.classList.remove('is-hidden');
            edit.classList.remove('is-hidden');
            field.classList.add('is-hidden');

            if (status) {
              showWarning('Phone changed');
              currentVal.textContent = inputs[0].value;
            } else {
              showError('Something went wrong');
            }
          });
        }
      });
    }




    function saveSettings(url, data, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('PATCH', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
      xhr.send(JSON.stringify(data));

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;

        if (xhr.status === 200 || xhr.status === 201) {
          callback(true);
        } else {
          var response = JSON.parse(xhr.responseText);

          callback(false, response.errors);
        }
      }
    }

    function createDataObj(collection) {
      console.log(collection);
      var obj = {};

      for (var i = 0; i < collection.length; i++) {
        var el = collection[i];

        obj[el.name] = el.value;
      }

      return obj;
    }

  })();
});