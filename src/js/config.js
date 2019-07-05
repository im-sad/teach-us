document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function() {
    var stepsContainers = document.getElementsByClassName('js-config-step');
    var stepsBtn = document.querySelectorAll('[data-step]');
    var pageHash = window.location.hash.substr(1);

    if (!stepsContainers) return;

    if (!pageHash) {
      DOMAnimations.fadeIn(stepsContainers[0], 300);
    } else {
      DOMAnimations.fadeIn(stepsContainers[2], 300);
    }


    validate.options = {format: "flat"};
    var constraints = {
      password: {
        presence: {message: "не пустое"},
        length: {
          minimum: 8,
          message: "must be at least 6 characters"
        }
      }
    };



    for (var i = 0; i < stepsContainers.length; i++) {
      //stepsContainers[i];
    }



    for (var j = 0; j < stepsBtn.length; j++) {
      stepsBtn[j].addEventListener('click', function() {
//        alert(this.dataset.step);
        //var error = validate({password: this.value}, constraints);
        //console.log(error);
      });
    }

    var form1 = document.getElementById('js-config-form1');
    form1.addEventListener('submit', function(e) {
      e.preventDefault();

      var error = validate(this, constraints);
      //var error = validate(this, constraints, {fullMessages: false});
      alert(error);
    })






  })();


});