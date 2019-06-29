document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function () {
    var testingBlock = document.getElementById('js-testing-student');

    if (testingBlock) {
      var testingVariants = testingBlock.getElementsByClassName('js-test-vars'), i = testingVariants.length;
      var stepsBtns = testingBlock.querySelectorAll('[data-step]'), j = stepsBtns.length;
      var stepper = document.getElementById('js-stepper');

      // Init vars
      if (testingVariants) {
        while (i--) {
          initVars(testingVariants[i]);
        }
      }

      // Init steps
      while (j--) {
        stepsBtns[j].addEventListener('click', function() {
          initStep(this.dataset.step);
        });
      }

      function initStep(step) {
        if (!step) return;

        var stepNextContainer = document.getElementById('step-' + step);
        var stepCurrentContainer = document.getElementById('step-' + (+step - 1));


        switch(step) {
          case '1':
            //todo add focus form
            console.log('start step 1');


            if (testingNums < testingLimit) {
              notyWarn.send({
                message: 'Choose up to ' + (testingLimit - testingNums) +' more options'
              });
              return
            }

            stepCurrentContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepNextContainer);
            break;

          case '2':
            //todo: remove tabindex
            console.log('start step 2');
            if (testingNums < testingLimit) {
              notyWarn.send({
                message: 'Choose up to ' + (testingLimit - testingNums) +' more options'
              });
              return
            }
            
            stepCurrentContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepNextContainer);
            break;

          case '3':
            if (testingNums < testingLimit) {
              notyWarn.send({
                message: 'Choose up to ' + (testingLimit - testingNums) +' more options'
              });
              return
            }
            stepCurrentContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepNextContainer);
            break;
          default:
            break;
        }
      }

    function initVars(scope) {
      if (!scope) return;

      var varsLimit = scope.dataset.max;
      var varsItems = scope.querySelectorAll('input[type="checkbox"]');

      for (var i = 0; i < varsItems.length; i++) {
        varsItems[i].addEventListener('change', function(e) {
          var validateResult = validateVars(varsItems, varsLimit);

          if (!validateResult) e.target.checked = false;
        });
      }
    }

    function validateVars(items, max) {
      var questionNum = checkedQuestionsNum(items);

      if (questionNum > max) {
        notyWarn.send({
          message: 'Maximum ' + max +' option'
        });

        return false;
      } else return true;
    }

    function checkedQuestionsNum(items) {
      if (!items) return false;

      var checkedQuestionsNum = 0;

      for (var l = 0; l < items.length; l++) {
        if (items[l].checked) checkedQuestionsNum++;
      }

      return checkedQuestionsNum;
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