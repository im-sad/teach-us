document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function () {
    var testingBlock = document.getElementById('js-testing-student');

    if (testingBlock) {
      var stepsBtns = testingBlock.querySelectorAll('[data-step]'), j = stepsBtns.length;
      var stepper = document.getElementById('js-stepper');
      var testingChecked;
      var testingLimit;

      // Init steps
      while (j--) {
        stepsBtns[j].addEventListener('click', function() {
          initStep(this.dataset.step);
        });
      }

      initStep(0);


      function initStep(step) {
        var stepContainer = document.getElementById('step-' + (+step - 1));
        var stepContainerNext;

        if (stepContainer) {
          stepContainerNext = document.getElementById('step-' + step);
        } else {
          stepContainer = document.getElementById('step-' + step);
        }
        
        var testingVariants;



        switch(step) {
          case '1':
            if (testingChecked < testingLimit) {
              notyWarn.send({
                message: 'Choose up to ' + (testingLimit - testingChecked) +' more options'
              });

              return;
            }

            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);
            testingChecked = 0;

            break;

          case '2':
            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);
            testingChecked = 0;

            testingVariants = stepContainerNext.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);

            break;

          case '3':
            if (testingChecked < testingLimit) {
              notyWarn.send({
                message: 'Choose up to ' + (testingLimit - testingChecked) + ' more options'
              });

              return;
            }

            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);

            testingVariants = stepContainerNext.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);

            testingChecked = 0;
            break;

          case 'finish':
            if (testingChecked < testingLimit) {
              notyWarn.send({
                message: 'Choose up to ' + (testingLimit - testingChecked) + ' more options'
              });

              return;
            }

            break;

          default:
            testingVariants = stepContainer.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);

            break;
        }


        //FUNC
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
            notyWarn.send({
              message: 'Maximum ' + max + ' option'
            });

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
    var regForm = document.getElementById('js-fastreg');

    if (regForm) {
      var regFormInputs = regForm.getElementsByTagName('input');
      var regFormBtn = regForm.getElementsByClassName('btn')[0];

      regFormBtn.addEventListener('click', function(e) {
        e.preventDefault();

        for (var k = 0; k < regFormInputs.length; k++) {
          validateInput(regFormInputs[k]);
        }
        
        if (isFormValid(regForm)) {
          testingBlock.classList.add('is-step2');
        }
      });

      function isFormValid(form) {
        if (form.getElementsByClassName('has-error').length < 1) return true;
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
              notyWarn.send({
                message: 'Wrong format'
              });
            } else {
              fieldRemoveError(input);
            }

            break;
          case 'checkbox':
            if (!input.checked && isFieldRequired(input)) {
              fieldAddError(input);
              notyWarn.send({
                message: 'To continue you must agree with terms of Service and Privacy Policy'
              });
            } else {
              fieldRemoveError(input);
            }

            break;
          default:
            break;
        }
      }


    }
  }

  }());
});