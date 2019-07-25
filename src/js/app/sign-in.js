document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var stepSing = document.getElementById('sign-me');
    var stepLost = document.getElementById('sendpass-me');
    var signForm = document.getElementById('js-signin-form');
    var lostpassForm = document.getElementById('js-lostpass-form');
    var signConstraints = {
      email: {
        presence: { message: "Email can't be blank" },
        email: { message: 'Wrong email format' }
      },
      password: {
        presence: { message: "Password can't be blank" },
        length: {
          minimum: 8,
          message: 'Password is too short. Minimum 8 symbols'
        }
      }
    };
    var lostConstraints = {
      lostpass: {
        presence: { message: "Email can't be blank" },
        email: { message: 'Wrong email format' }
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

          sendData(formData, '/users/sign_in.json', submitBtn, function(result) {
            if (result) window.location = '/profile.html';
          });
        }
      });
    }

    if (lostpassForm) {
      lostpassForm.addEventListener('submit', function(e) {
        e.preventDefault();

        var that = this;
        var lostpassErrors = validate(that, lostConstraints, {fullMessages: false});

        showValidateErrors(lostpassErrors || {}, that);

        if (!lostpassErrors) {
          var inputsList = signForm.getElementsByTagName('input');
          var submitBtn = that.getElementsByClassName('btn')[0];
          var formData = getFormData(inputsList);

          sendData(formData, '/users/sign_in.json', submitBtn, function(result) {
            if (result) {
              var doneMsg = lostpassForm.nextElementSibling;
        
              if (doneMsg) {
                lostpassForm.style.display = 'none';
                DOMAnimations.fadeIn(doneMsg);
              }
            }
          });
        }
      });
    }

    // If pass lost
    if (stepSing && stepLost) {
      var lostPassLink = document.getElementById('js-lost-pass');
      var backSignLink = document.getElementById('js-back-sign');

      if (lostPassLink) {
        lostPassLink.addEventListener('click', function() {
          stepSing.style.display = 'none';
          DOMAnimations.fadeIn(stepLost);
        });
      }

      if (backSignLink) {
        backSignLink.addEventListener('click', function() {
          stepLost.style.display = 'none';
          DOMAnimations.fadeIn(stepSing);
        });
      }
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

    function sendData(data, url, btn, callback) {
      var xhr = new XMLHttpRequest();

      btnStartLoad(btn);

      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
      xhr.send(JSON.stringify({ user: data }));

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;

        if (xhr.status === 200 || xhr.status === 201) {
          callback(true);
        } else {
          showError(JSON.parse(xhr.response).error);
        }

        btnEndLoad(btn);
      }
    }

  })();
});
