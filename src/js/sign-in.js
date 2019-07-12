document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
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
        clearAllMsgs();

        var that = this;
        that.disableValidation = true;

        var signErrors = validate(that, signConstraints, {fullMessages: false});
        showErrors(signErrors || {}, that);

        if (!signErrors) {
          var inputsList = signForm.getElementsByTagName('input');
          var submitBtn = that.getElementsByTagName('button')[0];
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

      function sendData(data, btn) {
        var xmlhttp = new XMLHttpRequest();

        btnStartLoad(btn);

        xmlhttp.open('POST', '/users/sign_in.json', true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
        xmlhttp.send(JSON.stringify({user: data}));

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState !== 4) return;

          if (xmlhttp.status === 200 || xmlhttp.status === 201) {
            // good
            window.location = '/profile.html';
          } else {
            // not good
            showError(JSON.parse(xmlhttp.response).error);
          }

          btnEndLoad(btn);
        }
      }
    }
  })();
});
