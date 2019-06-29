function btnStartLoad(btn) {
  btn.classList.add('has-load');
}

function btnEndLoad(btn) {
  btn.classList.remove('has-load');
}
document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function () {
    var cleanUp, debounce, i, len, ripple, rippleContainer, ripples, showRipple;

    debounce = function (func, delay) {
      var inDebounce;
      inDebounce = undefined;
      return function () {
        var args, context;
        context = this;
        args = arguments;
        clearTimeout(inDebounce);
        return inDebounce = setTimeout(function () {
          return func.apply(context, args);
        }, delay);
      };
    };

    showRipple = function (e) {
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

    cleanUp = function () {
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
            //console.log(checkedNum(testingVarsItems));

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
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
    var passEyeBtns = document.getElementsByClassName('js-pass-eye');

    for (var i = 0; i < passEyeBtns.length; i++) {
      passEyeBtns[i].addEventListener('click', function(e) {
        var field = e.target.parentNode;
        var input = field.getElementsByTagName('input')[0];

        if (!input) return;

        if (input.getAttribute('type') == 'password') {
          field.classList.add('is-pass-show');
          input.setAttribute('type', 'text');
        } else {
          field.classList.remove('is-pass-show');
          input.setAttribute('type', 'password');
        }
      });
    }

  }());
});

function Tabs(scope, optionsTab) {
  var options = {
    classTabSwitchWrapper: 'tabs-base__switch',
    classTabSwitchItem: 'tabs-base__switch-item',
    classTabContentWrapper: 'tabs-base__content',
    classTabContentItem: 'tabs-base__content-item',
    activeClass: 'is-active',
    optionTab: 0,
    accordion: false,
    accordionResponsive: 1024,
    hash: false,
    hashName: 'tab',
    initCallback: false,
    toTabCallback: false
  }

  for (var key in optionsTab) {
    if (optionsTab.hasOwnProperty(key)) {
      if (optionsTab[key] !== undefined) {
        options[key] = optionsTab[key];
      }
    }
  }

  var tabsObj = this;

  var tabsSwitchElement = scope.getElementsByClassName(options.classTabSwitchWrapper)[0];
  var tabsContentElement = scope.getElementsByClassName(options.classTabContentWrapper)[0];
  var tabsSwitchItems = tabsSwitchElement.getElementsByClassName(options.classTabSwitchItem);
  var tabsContentItemsAll = tabsContentElement.getElementsByClassName(options.classTabContentItem)[0].parentNode.childNodes;
  var tabsContentItems = [].filter.call(tabsContentItemsAll, function(item) {
    if (item.nodeType !== Node.TEXT_NODE) return item.classList.contains(options.classTabContentItem);
  });

  if (!tabsSwitchElement || !tabsContentElement || !tabsSwitchItems.length || !tabsContentItemsAll.length) return false;

  var currentWindowWidth = window.innerWidth;
  var isAccordion = false;
  var accordeonItems;
  var current = 0;

  if (options.hash) {
    window.State = window.State || {};
    window.StateTabs = window.StateTabs || {};

    State[options.hashName] = {
      name: '',
      parentClass: options.classTabSwitchWrapper
    };

    StateTabs[options.hashName] = tabsObj;

    initLocationTab();

    window.onpopstate = function (e) {
      if (e.state) {
        initLocationTab(e.state);
      }
    }
  } else {
    init();
  }

  function init(startTab) {
    if (options.accordion) {
      accordeonItems = scope.querySelectorAll('.' + options.accordion);
      isAccordion = (currentWindowWidth <= options.accordionResponsive) ? true : false;

      for (var j = 0; j < tabsSwitchItems.length; j++) {
        accordeonItems[j].addEventListener('click', function (e) {
          toTab(getChildIndex(e.target, options.classTabContentWrapper) / 2);
        })
      }

      window.addEventListener('resize', throttle(function () {
        currentWindowWidth = window.innerWidth;

        if ((currentWindowWidth > options.accordionResponsive) && (isAccordion)) {
          isAccordion = false;
          toTab(0, true);
        }

        isAccordion = (currentWindowWidth <= options.accordionResponsive) ? true : false;
      }, 100));
    }

    //show first item
    _showItem(startTab || options.optionTab);
    current = startTab || options.optionTab;

    if (!isAccordion) {
      if (tabsSwitchItems.length === 1) {
        tabsSwitchElement.classList.add('is-single');
      }
    }

    for (var i = 0; i < tabsSwitchItems.length; i++) {
      if (tabsContentItems[i]) {
        tabsSwitchItems[i].addEventListener('click', function (e) {
          var newTabItem = getChildIndex(e.target.closest('.' + options.classTabSwitchItem), options.classTabSwitchWrapper);

          toTab(newTabItem);
        })
      }
    }

    if (options.init) {
      var _init = options.init;

      _init.call(this, current, tabsContentItems[current]);
    }

    if (options.initCallback) {
      var _initCallback = options.initCallback;

      _initCallback.call(this, current, tabsContentItems[current], tabsObj);
    }
  }

  function getChildIndex(child, parentClass) {
    var parent = child.closest('.' + parentClass);
    var i = parent.children.length - 1;

    for (; i >= 0; i--) {
      if (child == parent.children[i]) {
        break;
      }
    }
    return i;
  }

  function toTab(number, noClickEvent) {
    if ((current === number) && (!isAccordion) && (!noClickEvent)) {
      return;
    }

    current = number;

    if (isAccordion) {
      if (!hasClass(accordeonItems[number], options.activeClass)) {
        _showItem(number);
      } else {
        _hideItem(number);
      }
    } else {
      var prevTabs = tabsSwitchElement.querySelectorAll('.' + options.classTabSwitchItem + '.' + options.activeClass);

      for (var i = 0; i < prevTabs.length; i++) {
        _hideItem(getChildIndex(prevTabs[i], options.classTabSwitchWrapper));
      }
      _showItem(number);
    }

    if (options.toTabCallback) {
      var _toTabCallback = options.toTabCallback;

      _toTabCallback.call(this, current, tabsContentItems[current], tabsObj);
    }

    if (options.hash) {
      setHash(number);
    }
  }

  function _showItem(number) {
    tabsSwitchItems[number].classList.add(options.activeClass);
    tabsContentItems[number].classList.add(options.activeClass);

    if (options.accordion) {
      accordeonItems[number].classList.add(options.activeClass);
    }
  }

  function _hideItem(number) {
    tabsSwitchItems[number].classList.remove(options.activeClass);
    tabsContentItems[number].classList.remove(options.activeClass);

    if (options.accordion) {
      accordeonItems[number].classList.remove(options.activeClass);
    }
  }

  function _setLocation(hash) {
    var url = window.location.href;
    var hashName = options.hashName;
    var hashStr = hashName + '=' + hash;
    var hashIndex = url.indexOf(hashName + '=');

    if (hashIndex !== -1) {
      var sepIndex = url.substr(hashIndex).indexOf('&', 1);

      newUrl = (sepIndex === -1) ? (url.slice(0, hashIndex) + hashStr) : (url.slice(0, hashIndex) + hashStr + url.slice(hashIndex + sepIndex, url.length));
    } else {
      newUrl = (url.indexOf('#') === -1) ? (url + '#' + hashStr) : (url + '&' + hashStr);
    }

    if (!history.state || history.state.tabs !== hash) {
      history.pushState(State, '', newUrl);
    }

    window.location.href = newUrl;
  }

  function setHash(num) {
    var hash = tabsSwitchItems[num].dataset.tabHash;

    State[options.hashName].name = hash;
    if (hash) {
      _setLocation(hash);
    }
  }

  function parseHashLocation() {
    var hash = window.location.hash.slice(1);
    var result = hash.split('&').reduce(function (result, item) {
      var parts = item.split('=');

      result[parts[0]] = parts[1];
      return result;
    }, {});

    return result;
  }

  function initLocationTab(currentState) {
    var locations = parseHashLocation();
    var hash;
    var hashName;

    if (currentState) {
      for (item in State) {
        if (locations[item] !== State[item].name) {
          hash = locations[item];
          hashName = item;
        }
      }
    }

    hash = hash || locations[options.hashName];
    hashName = hashName || options.hashName;
    State[hashName].name = hash;

    var searchAttr = '[data-tab-hash="' + hash + '"]';
    var searchTab = document.querySelector(searchAttr);

    if (searchTab) {
      tabIndex = getChildIndex(searchTab, State[hashName].parentClass);

      if (currentState) {
        StateTabs[hashName].toTab(tabIndex);
      } else {
        init(tabIndex);
      }
    } else {
      init();
    }
  }

  function nextTab() {
    if (current < tabsSwitchItems.length) {
      toTab(current + 1);
    }
  }

  function prevTab() {
    if (current > 0) {
      toTab(current - 1);
    }
  }

  function getCurrent() {
    return current;
  }

  this.toTab = function (number) {
    toTab(number);
  }

  this.options = options;

  this.next = nextTab;

  this.prev = prevTab;

  this.getCurrent = getCurrent;

  this.length = tabsSwitchItems.length;
}

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



document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
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



document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function () {
    var editOption = document.getElementById('js-editval');
    var formChangePass = document.getElementById('js-form-pass');

    if (editOption) {
      editValue(editOption);
    }

    if (formChangePass) {
      var formChangePassBtn = formChangePass.getElementsByClassName('btn')[0];

      formChangePass.addEventListener('submit', function(e) {
        e.preventDefault();

        if (formChangePassBtn) {
          btnStartLoad(formChangePassBtn);
        }

        // тут будет AJAX
        setTimeout(function() {
          btnEndLoad(formChangePassBtn);
        }, 3000);
      });
    }


    function editValue(scope) {
      var currentVal = scope.querySelector('[data-val]');
      var edit = scope.getElementsByClassName('js-editval-change')[0];
      var field = scope.getElementsByClassName('js-editval-field')[0];
      var input = field.getElementsByTagName('input')[0];
      var save = field.getElementsByTagName('button')[0];

      edit.addEventListener('click', function() {
        this.classList.add('is-hidden');
        currentVal.classList.add('is-hidden');
        field.classList.remove('is-hidden');
      });

      save.addEventListener('click', function() {
        var newPhone = input.value;
        //TODO: валидация

        btnStartLoad(this);

        // тут будет AJAX
        setTimeout(function() {
          currentVal.textContent = newPhone;
          currentVal.classList.remove('is-hidden');
          edit.classList.remove('is-hidden');
          field.classList.add('is-hidden');
          btnEndLoad(save);
        }, 1000);
      });
    }
  })();
});

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
    var baseTabs = document.getElementsByClassName('js-tabs')[0];

    if (baseTabs) new Tabs(baseTabs);
  })();
});