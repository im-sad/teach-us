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

    window.onpopstate = function(e) {
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
        accordeonItems[j].addEventListener('click', function(e) {
          toTab(getChildIndex(e.target, options.classTabContentWrapper) / 2);
        })
      }

      window.addEventListener('resize', throttle(function() {
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
        tabsSwitchItems[i].addEventListener('click', function(e) {
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
    var result = hash.split('&').reduce(function(result, item) {
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

  this.toTab = function(number) {
    toTab(number);
  }

  this.options = options;

  this.next = nextTab;

  this.prev = prevTab;

  this.getCurrent = getCurrent;

  this.length = tabsSwitchItems.length;
}
