document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var cleanUp, debounce, i, len, ripple, rippleContainer, ripples, showRipple;

    debounce = function(func, delay) {
      var inDebounce;

      inDebounce = undefined;
      return function() {
        var args, context;

        context = this;
        args = arguments;
        clearTimeout(inDebounce);
        return inDebounce = setTimeout(function() {
          return func.apply(context, args);
        }, delay);
      };
    };

    showRipple = function(e) {
      var pos, ripple, rippler, size, style, x, y;

      ripple = this;
      rippler = document.createElement('span');
      size = ripple.offsetWidth;
      pos = ripple.getBoundingClientRect();
      x = e.pageX - pos.left - (size / 2);
      y = e.pageY - pos.top - (size / 2);
      style = 'top:' + y + 'px; left: ' + x + 'px; height: ' + size + 'px; width: ' + size + 'px;';
      ripple.rippleContainer.appendChild(rippler);

      return rippler.setAttribute('style', style);
    };

    cleanUp = function() {
      while (this.rippleContainer.firstChild) {
        this.rippleContainer.removeChild(this.rippleContainer.firstChild);
      }
    };

    ripples = document.querySelectorAll('[data-ripple]');

    for (i = 0, len = ripples.length; i < len; i++) {
      ripple = ripples[i];
      rippleContainer = document.createElement('span');
      rippleContainer.className = 'ripple';
      ripple.addEventListener('mousedown', showRipple);
      ripple.addEventListener('mouseup', debounce(cleanUp, 2000));
      ripple.rippleContainer = rippleContainer;
      ripple.appendChild(rippleContainer);
    }
  }());
});