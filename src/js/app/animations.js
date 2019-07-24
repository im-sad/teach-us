var DOMAnimations = {
  slideUp: function slideUp(element, ms) {
    var duration = ms || 500;

    return new Promise(function(resolve, reject) {
      element.style.height = element.offsetHeight + 'px';
      element.style.transitionProperty = 'height, margin, padding';
      element.style.transitionDuration = duration + 'ms';
      element.offsetHeight;
      element.style.overflow = 'hidden';
      element.style.height = 0;
      element.style.paddingTop = 0;
      element.style.paddingBottom = 0;
      element.style.marginTop = 0;
      element.style.marginBottom = 0;
      window.setTimeout(function() {
        element.style.display = 'none';
        element.style.removeProperty('height');
        element.style.removeProperty('padding-top');
        element.style.removeProperty('padding-bottom');
        element.style.removeProperty('margin-top');
        element.style.removeProperty('margin-bottom');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition-duration');
        element.style.removeProperty('transition-property');
        resolve(false);
      }, duration);
    });
  },
  slideDown: function slideDown(element, ms) {
    var duration = ms || 500;

    return new Promise(function(resolve, reject) {
      element.style.removeProperty('display');
      var display = window.getComputedStyle(element).display;

      if (display === 'none') {
        display = 'block';
      }

      element.style.display = display;
      var height = element.offsetHeight;
  
      element.style.overflow = 'hidden';
      element.style.height = 0;
      element.style.paddingTop = 0;
      element.style.paddingBottom = 0;
      element.style.marginTop = 0;
      element.style.marginBottom = 0;
      element.offsetHeight;
      element.style.transitionProperty = 'height, margin, padding';
      element.style.transitionDuration = duration + 'ms';
      element.style.height = height + 'px';
      element.style.removeProperty('padding-top');
      element.style.removeProperty('padding-bottom');
      element.style.removeProperty('margin-top');
      element.style.removeProperty('margin-bottom');
      window.setTimeout(function() {
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition-duration');
        element.style.removeProperty('transition-property');
      }, duration);
    });
  },
  slideToggle: function slideToggle(element, ms) {
    var duration = ms || 500;

    if (window.getComputedStyle(element).display === 'none') {
      return this.slideDown(element, duration);
    } else {
      return this.slideUp(element, duration);
    }
  },
  fadeOut: function fadeOut(element, ms) {
    var s = element.style;
    var step = 25 / (ms || 300);

    s.opacity = s.opacity || 1;
    (function fade() { (s.opacity -= step) < 0 ? s.display = 'none' : setTimeout(fade, 25); })();
  },
  fadeIn: function fadeIn(element, ms, display) {
    var s = element.style;
    var step = 25 / (ms || 300);

    s.opacity = s.opacity || 0;
    s.display = display || 'block';
    (function fade() { (s.opacity = parseFloat(s.opacity) + step) > 1 ? s.opacity = 1 : setTimeout(fade, 25); })();
  },
  fadeToggle: function slideToggle(element, ms, display) {
    var duration = ms || 500;
    var type = display || 'block';

    if (window.getComputedStyle(element).display === 'none') {
      return this.fadeIn(element, duration, type);
    } else {
      return this.fadeOut(element, duration);
    }
  }
};