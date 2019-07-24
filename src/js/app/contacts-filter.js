document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var contactsSearch = document.getElementById('js-contacts-search');
    var contactsList = document.getElementById('js-contacts-list');

    if (contactsSearch && contactsList) {
      contactsSearch.addEventListener('keyup', function() {
        searchContacts(this.value);
      });
    }

    function searchContacts(text) {
      var searchString = text.toUpperCase();
      var searchItem = contactsList.getElementsByClassName('contacts-list__item');
      var i = searchItem.length;
      var el;
      var txtValue;

      while (i--) {
        el = searchItem[i].querySelector('[data-search]');
        txtValue = el.dataset.search || '';
  
        if (txtValue.toUpperCase().indexOf(searchString) > -1) {
          searchItem[i].style.display = null;
        } else {
          searchItem[i].style.display = 'none';
        }
      }
    }

  })();
});


