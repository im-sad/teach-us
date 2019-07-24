document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var signForm = document.getElementById('js-signin-form');
    var signConstraints = {
      sign_mail: {
        presence: { message: "Email can't be blank" },
        email: { message: "Wrong email format" }
      },
      sign_pass: {
        presence: { message: "Password can't be blank" },
        length: {
          minimum: 8,
          message: "Password is too short. Minimum 8 symbols"
        }
      }
    };

    if (signForm) {
      signForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var that = this;
        var signErrors = validate(that, signConstraints, {fullMessages: false});

        showValidateErrors(signErrors || {}, that);

        if (!signErrors) {
          var inputsList = signForm.getElementsByTagName('input');
          var submitBtn = that.getElementsByClassName('btn')[0];
          var formData = getFormData(inputsList);

          sendData(formData, submitBtn);
        }
      });
    }

    function getFormData(items) {
      var data = {};
      var name;
      var type;

      for (var k = 0; k < items.length; k++) {
        name = items[k].name;
        type = items[k].type;

        if (type === 'checkbox' && !items[k].checked) {
          continue;
        } else {
          data[name] = items[k].value;
        }
      }

      return data;
    }

    function sendData(data, btn) {
      var xhr = new XMLHttpRequest();

      btnStartLoad(btn);

      xhr.open('POST', '/users/sign_in.json', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
      xhr.send(JSON.stringify({ user: data }));

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;

        if (xhr.status === 200 || xhr.status === 201) {
          window.location = '/profile.html';
        } else {
          showError(JSON.parse(xhr.response).error);
        }

        btnEndLoad(btn);
      }
    }

  })();
});
