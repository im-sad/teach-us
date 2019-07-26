document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var linkForStudent = document.getElementById('js-link-student');
    var linkForTeacher = document.getElementById('js-link-teacher');

    if (linkForStudent) {
      linkForStudent.addEventListener('click', function() {
        reachGoal.all('RegStartStudent');
        reachGoal.all('RegStart');
      });
    }

    if (linkForTeacher) {
      linkForTeacher.addEventListener('click', function() {
        reachGoal.all('RegStartTeacher');
        reachGoal.all('RegStart');
      });
    }
  })();

  (function() {
    var userNavigation = document.getElementById('js-nav-goals');
    var userNavigationLink;
    var userNavigationData = sessionStorage.getItem('goal-nav');

    if (userNavigationData) return;

    if (userNavigation) {
      userNavigationLink = userNavigation.getElementsByTagName('a');

      for (var i = 0; i < userNavigationLink.length; i++) {
        userNavigationLink[i].addEventListener('click', function() {
          sessionStorage.setItem('goal-nav', 'clicked');
          reachGoal.all('ProfileTabClicked');
        });
      }
    }
  })();
});