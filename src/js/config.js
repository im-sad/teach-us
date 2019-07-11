document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var stepsContainers = document.getElementsByClassName('js-config-step');
    var cfgForms = document.getElementsByClassName('js-config-form');
    var cfgSkip = document.getElementsByClassName('js-skip-config');
    var constraints = [
      {
        password: {
          presence: true,
          length: {
            minimum: 8,
            message: "must be at least 6 characters"
          }
        }
      },
      {
        phone: {
          presence: true,
          format: {
            pattern: "\\d{6}"
          }
        }
      },
      {
        name: {
          presence: true,
        },
        lastname: {
          presence: true,
        },
        state: {
          presence: true,
        },
        city: {
          presence: true,
        },
        zip: {
          format: {
            pattern: "\\d{5}"
          }
        },
      }
    ];

    if (!stepsContainers) return;

    updateActiveContainer();

    // forms
    for (var i = 0; i < cfgForms.length; i++) {
      cfgForms[i].addEventListener('submit', function(e) {
        e.preventDefault();
        var that = this;
        var thatStep = +this.dataset.step - 1;
        var thatStepNext = +this.dataset.step;
        var stepUrl;

        //validate
        var formErrors = validate(that, constraints[thatStep]);
        //var error = validate(this, constraints, {fullMessages: false});
        var formFields = that.querySelectorAll('input[name], select[name]');

        showErrors(formErrors || {}, formFields);

        //submit
        if (!formErrors) {
          switch (thatStep) {
            case 0:
              stepUrl = '/users/registrations/set_password';
              break;
            case 1:
              stepUrl = '/users/registrations/set_phone';
              break;
            default:
              stepUrl = '/users/registrations';
          }

          formSubmit(that, stepUrl, formFields, function(status) {
            if (!status) return false;

            switch (thatStep) {
              case 2:
                window.location.href = "/profile.html";
                break;
              default:
                stepsContainers[thatStep].style.display = 'none';
                DOMAnimations.fadeIn(stepsContainers[thatStepNext], 300);
            }
          });
        }
      });
    }

    // skip links
    for (var j = 0; j < cfgSkip.length; j++) {
      cfgSkip[j].addEventListener('click', function(e) {
        e.preventDefault();
        var href = this.getAttribute('href');

        if (href) window.location.replace(href);
        updateActiveContainer();
      });
    }


    // Functions
    function updateActiveContainer() {
      var pageHash = window.location.hash.substr(1);

      for (var i = 0; i < stepsContainers.length; i++) {
        stepsContainers[i].style.display = 'none';
      }

      if (!pageHash) {
        DOMAnimations.fadeIn(stepsContainers[0], 300);
      } else if (pageHash === 'step2') {
        DOMAnimations.fadeIn(stepsContainers[1], 300);
      } else if (pageHash === 'step3') {
        DOMAnimations.fadeIn(stepsContainers[2], 300);
      }
    }

    function showErrors(errors, fields) {
      for (var i = 0; i < fields.length; i++) {
        showErrorsForInput(fields[i], errors && errors[fields[i].name]);
      }
    }

    function showErrorsForInput(input, errors) {
      var formField = closestParent(input.parentNode, 'field');

      if (!formField) return;
  
      var messages = document.createElement('div');
      messages.classList.add('field__error');
      formField.appendChild(messages);

      resetformField(formField);

      if (errors) {
        input.classList.add('has-error');
    
        //errors.forEach(function(error){
        //  addError(messages, error);
        //});
      } else {
        input.classList.remove('has-error');
      }
    }

    function closestParent(child, className) {
      if (!child || child == document) {
        return null;
      }
      if (child.classList.contains(className)) {
        return child;
      } else {
        return closestParent(child.parentNode, className);
      }
    }

    function resetformField(formField) {
      // Remove the success and error classes
      formField.classList.remove('has-error');
      formField.classList.remove('has-success');

      ///_.each(formField.querySelectorAll(".help-block.error"), function(el) {
      ///  el.parentNode.removeChild(el);
      ///});
    }

    function addError(messages, error) {
      var block = document.createElement('p');
      block.classList.add('help-block');
      block.classList.add('error');
      block.innerText = error;
      messages.appendChild(block);
    }

    function formSubmit(form, url, inputs, callback) {
      if (!form) return;

      var sendBtn = form.getElementsByClassName('btn')[0];
      var xmlhttp = new XMLHttpRequest();
      var data = createDataObj(inputs);

      if (sendBtn) {
        btnStartLoad(sendBtn);
      }

      xmlhttp.open('PATCH', url, true);
      xmlhttp.setRequestHeader('Content-Type', 'application/json');
      xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
      xmlhttp.send(JSON.stringify(data));

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState !== 4) return;

        if (xmlhttp.status === 200 || xmlhttp.status === 201) {
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
        
        if (el.type === 'file') {
          var image = el.parentElement.getElementsByTagName('img')[0];

          if (image && image.src) obj[el.name] = image.src;
        } else {
          obj[el.name] = el.value;
        }
      }

      return obj;
    }




  })();

});