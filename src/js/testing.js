document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function () {
    var testingBlock = document.getElementById('js-testing-student');

    if (testingBlock) {
      var testingNextBtn = testingBlock.getElementsByClassName('js-test-next')[0];
      var testingSteps = testingBlock.getElementsByClassName('js-test-steps')[0];
      var testingVars = testingBlock.getElementsByClassName('js-test-vars')[0];
      var regForm = document.getElementById('js-fastreg');

      if (testingVars) {
        var varsLimit = testingVars.dataset.max;
        var testingVarsItems = testingVars.querySelectorAll('input[type="checkbox"]');
        
        for (var i = 0; i < testingVarsItems.length; i++) {
          testingVarsItems[i].addEventListener('change', function(e) {
            console.log(checkedNum(testingVarsItems));

            if (checkedNum(testingVarsItems) >= varsLimit) {
              testingVars.classList.add('has-limit');
            } else {
              testingVars.classList.remove('has-limit');
            }

            if (checkedNum(testingVarsItems) > varsLimit) {
              e.target.checked = false;
            }
          });
        }
      }

      // Save email
      if (regForm) {
        var regFormEmail = regForm.getElementsByClassName('js-fastreg-email')[0];
        var regFormBtn = regForm.getElementsByTagName('button')[0];

        regFormBtn.addEventListener('click', function() {
          testingBlock.classList.add('is-step2');
        });


        function isFormValid() {
          return;
        }
      }



    }

    function checkedNum(collection) {
      if (!collection) return false;

      var checkedNum = 0;

      for (var i = 0; i < collection.length; i++) {
        if (collection[i].checked) checkedNum++;
      }

      return checkedNum;
    }
  }());
});