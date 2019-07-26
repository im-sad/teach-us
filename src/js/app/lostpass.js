document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var lostForm = document.getElementById('js-newpass-form');
    var constraints = {
      password: {
        presence: true,
        length: {
          minimum: 8,
          message: 'must be at least 8 characters'
        }
      }
    };

    if (!lostForm) return;

    lostForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var that = this;

      //validate
      var formErrors = validate(that, constraints);
      var formFields = that.querySelectorAll('input[name]');

      showValidateErrors(formErrors || {}, formFields);

      //submit
      if (!formErrors) {
        formSubmit(that, '/users/password', formFields, function(status, response) {
          if (!status) {
            var errorText = 'Something went wrong'
            if (JSON.parse(response).errors.reset_password_token.filter((obj) => obj == 'is invalid').length > 0) {
              errorText = 'Your reset password link is not valid. Please request another one.'
            }
            showError(errorText)
          } else {
            window.location.href = '/profile';
          }
        });
      }
    });

    // Functions
    function formSubmit(form, url, inputs, callback) {
      if (!form) return;

      var sendBtn = form.getElementsByClassName('btn')[0];
      var xhr = new XMLHttpRequest();
      var data = createDataObj(inputs);

      btnStartLoad(sendBtn);

      xhr.open('PATCH', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
      xhr.send(JSON.stringify({ user: data }));

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;

        if (xhr.status === 200 || xhr.status === 201) {
          callback(true);
        } else {
          callback(false, xhr.response);
        }

        btnEndLoad(sendBtn);
      }
    }

    function createDataObj(collection) {
      var obj = {};

      for (var i = 0; i < collection.length; i++) {
        var el = collection[i];
        
        obj[el.name] = el.value;
      }

      return obj;
    }

  })();

});