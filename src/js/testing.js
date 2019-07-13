document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function () {
    var testingBlock = document.getElementById('js-testing-student');

    if (testingBlock) {
      var stepsBtns = testingBlock.querySelectorAll('[data-to-step]'), j = stepsBtns.length;
      var stepperBlock = document.getElementById('js-test-steps');
      var testingChecked = 0;
      var testingLimit;
      var testingResult = {};
      var testingVariants;

      // Init steps
      while (j--) {
        stepsBtns[j].addEventListener('click', function() {
          initStep(this.dataset.toStep);
        });
      }

      initStep('0');

      function initStep(step) {
        var stepContainer = document.getElementById('step-' + (+step - 1));
        var stepContainerNext;

        if (stepContainer) {
          stepContainerNext = document.getElementById('step-' + step);
        } else {
          stepContainer = document.getElementById('step-' + step);
        }

        switch(step) {
          case '0':
            testingVariants = stepContainer.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);
            break;

          case '1':
            if (testingChecked < testingLimit) {
              showLimitMsg(testingChecked, testingLimit);
              return;
            }

            testingResult['step1'] = getVars(testingVariants);

            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);

            testingChecked = 0;
            break;

          case '2':
            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);

            testingVariants = stepContainerNext.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);
            setStep(2);
            testingChecked = 0;
            break;

          case '3':
            if (testingChecked < testingLimit) {
              showLimitMsg(testingChecked, testingLimit);
              return;
            }

            testingResult['step2'] = getVars(testingVariants);

            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);

            testingVariants = stepContainerNext.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);

            testingChecked = 0;
            setStep(3);
            break;

          case 'finish':
            if (testingChecked < testingLimit) {
              showLimitMsg(testingChecked, testingLimit);
              return;
            }

            testingResult['step3'] = getVars(testingVariants);
            sendTesting(testingResult);
            break;

          default:
            break;
        }

        function sendTesting(data) {
          var finishBtn = document.getElementById('js-test-finish');
          var xmlhttp = new XMLHttpRequest();

          if (finishBtn) finishBtn.classList.add('has-load');

          xmlhttp.open('POST', '/survey_answers', true);
          xmlhttp.setRequestHeader('Content-Type', 'application/json');
          xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
          xmlhttp.send(JSON.stringify(data));

          xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState !== 4) return;

            if (xmlhttp.status === 200 || xmlhttp.status === 201) {
              window.location = '/profile.html';
            } else {
              showError('Something went wrong');
              if (finishBtn) finishBtn.classList.remove('has-load');
            }
          }
        }

        function showLimitMsg(checked, limit) {
          if (checked < limit) {
            showWarning('Choose up to ' + (limit - checked) + ' more options');
            return false;
          }
        }

        function setStep(step) {
          if (!step) return;

          var items = stepperBlock.querySelectorAll('[data-step]');

          for (var i = 0; i < items.length; i++) {
            if (items[i].dataset.step == step) {
              items[i].classList.add('is-active');
            } else {
              items[i].classList.remove('is-active');
            }
          }
        }
  
        function getVars(scope) {
          var varsItems = scope.querySelectorAll('input[type="checkbox"]:checked');
          var array = [];

          for (var i = 0; i < varsItems.length; i++) {
            array.push(varsItems[i].value);
          }

          return array;
        }

        function initVars(scope) {
          if (!scope) return;

          var varsLimit = scope.dataset.max;
          var varsItems = scope.querySelectorAll('input[type="checkbox"]');

          for (var i = 0; i < varsItems.length; i++) {
            varsItems[i].addEventListener('change', function (e) {
              var validateResult = validateVariants(varsItems, varsLimit);

              if (!validateResult) e.target.checked = false;
            });
          }

          return varsLimit;
        }

        function validateVariants(items, max) {
          var questionNum = checkedSum(items);

          if (questionNum > max) {
            showWarning('Maximum ' + max + ' option');
            return false;
          } else return true;
        }

        function checkedSum(items) {
          if (!items) return false;

          var checkedItems = 0;

          for (var l = 0; l < items.length; l++) {
            if (items[l].checked) checkedItems++;
          }

          testingChecked = checkedItems;
          return checkedItems;
        }
      }


    // Main form
    var regBlock = document.getElementById('js-fastreg');

    if (regBlock) {
      var regBlockForm = regBlock.getElementsByTagName('form')[0];
      var regBlockInputs = regBlock.querySelectorAll('input[name]');
      var regBlockBtn = regBlock.getElementsByClassName('btn')[0];
      var constraints = {
        mail: {
          presence: { message: "Email can't be blank" },
          email: { message: "Wrong email format" }
        },
        terms: {
          presence: { message: "To continue you must agree with terms of Service and Privacy Policy" }
        }
      };

      regBlockForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var that = this;

        var regErrors = validate(that, constraints, {fullMessages: false});
        showValidateErrors(regErrors || {}, that);

        if (!regErrors) {
          var formData = createInputsObj(regBlockInputs);
          sendFormData(formData, '/users/registrations', regBlockBtn);
        }
      });


      function sendFormData(data, url, btn) {
        var xmlhttp = new XMLHttpRequest();

        btnStartLoad(btn);

        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
        xmlhttp.send(JSON.stringify(data));

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState !== 4) return;

          if (xmlhttp.status === 200 || xmlhttp.status === 201) {
            testingBlock.classList.add('is-step2');
          } else if (xmlhttp.status === 422) {
            var response = JSON.parse(xmlhttp.responseText);

            if (response.errors.email.filter((obj) => obj.predicate == 'not_unique').length > 0) {
              showWarning('An account with this email already exists. Please log in');
            }
          } else {
            return false;
          }

          btnEndLoad(btn);
        }
      }

      function createInputsObj(collection) {
        var obj = {};

        for (var i = 0; i < collection.length; i++) {
          if (collection[i].type === 'checkbox' && !collection[i].checked) {
            continue;
          } else {
            obj[collection[i].name] = collection[i].value;
          }
        }

        return obj;
      }
    }
  }

  }());
});