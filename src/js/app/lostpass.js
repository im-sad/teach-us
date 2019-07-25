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
      //var error = validate(this, constraints, {fullMessages: false});
      var formFields = that.querySelectorAll('input[name]');

      showValidateErrors(formErrors || {}, formFields);

      //submit
      if (!formErrors) {
        formSubmit(that, '/users/registrations/set_password', formFields, function(status) {
          if (!status) return false;

          window.location.href = '/profile.html';
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
      xhr.send(JSON.stringify(data));

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;

        if (xhr.status === 200 || xhr.status === 201) {
          callback(true);
        } else {
          callback(false);
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