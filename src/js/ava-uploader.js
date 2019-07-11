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
      var fileSize = input.files[0].size / 1000;
      var fileSizeLimit = input.size / 1000;

      if (fileSize > fileSizeLimit) {
        showError('Maximum image size is <b>'+ fileSizeLimit + 'kb</b>');
        return false;
      }

      while (l--) {
        imagesInside[l].remove();
      }

      var newImage = document.createElement('img');
      var fileLink = input.files[0];

      if (!fileLink) return;

      var reader = new FileReader();

      reader.onload = function(file) {
        newImage.setAttribute('src', file.target.result);
      };

      reader.readAsDataURL(fileLink);

      parentNode.insertBefore(newImage, input.nextSibling);
    }
  })();
});
