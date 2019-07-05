document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function() {
    var avaInputs = document.getElementsByClassName('js-ava-uploader');

    for (var i = 0; i < avaInputs.length; i++) {
      avaInputs[i].addEventListener('input', function() {
        showLoadedImg(this);
      });
    }

    function showLoadedImg(input) {
      var parentNode = input.parentNode;
      var imagesInside = parentNode.getElementsByTagName('img'), l = imagesInside.length;

      while (l--) {
        imagesInside[l].remove();
      }

      var newImage = document.createElement('img');
      newImage.setAttribute('src', window.URL.createObjectURL(input.files[0]));

      parentNode.insertBefore(newImage, input.nextSibling);
    }
  })();
});
