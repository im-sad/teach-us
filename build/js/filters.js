document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
    var filter = document.getElementsByClassName('js-filter')[0];

    if (filter) {
      var filterChilds = filter.children, i = filterChilds.length;

      while (i--) {
        filterChilds[i].addEventListener('click', function(e) {
          checkFilter(filterChilds);
          e.target.classList.add('is-active');

          var thisFilter = e.target.dataset.filter;
          var cards = document.getElementsByClassName('card-req'), k = cards.length;


          while (k--) {
            if (thisFilter == 'all') {
              cards[k].classList.remove('is-hidden');
            } else if (!cards[k].classList.contains('card-req--' + thisFilter)) {
              cards[k].classList.add('is-hidden');
            } else {
              cards[k].classList.remove('is-hidden');
            }
          }
        });
      }

      function checkFilter(collection) {
        for (var j = 0; j < collection.length; j++) {
          collection[j].classList.remove('is-active');
        }
      }

    }
  })();
});