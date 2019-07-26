// Modal window
// @constructor
// @param  {Object} scope - modal element
// @param  {Object} modalOptions - modal options

function Modal(scope, modalOptions) {
  var defaultOptions = {
    overlay: true,
    closeOnOverlay: true,
    closeOnEsc: true,
    openClass: 'modal--is-show',
    closeButtonClass: 'modal__close',
  }

  var options = defaultOptions;

  for (var key in modalOptions) {
    if (modalOptions.hasOwnProperty(key)) {
        if (modalOptions[key] !== undefined) {
            options[key] = modalOptions[key];
        }
    }
  }

  var _body = document.body;
  var modalEl = scope;
  var modalInner = modalEl.firstElementChild;
  var closeBtns = modalEl.getElementsByClassName(options.closeButtonClass);
  var overlayShowClass = 'modal__overlay--is-show';

  if (options.overlay) {
    var overlay = scope.getElementsByClassName('modal__overlay')[0];

    if (!overlay) {
      _drawOverlay();
    }
  }

  init();

  function init() {
    if (closeBtns.length) {
      for (var i = 0; i < closeBtns.length; i++) {
        closeBtns[i].addEventListener('click', function() {
          closeModal();
        });
      }
    }

    if (options.closeOnEsc) {
      document.addEventListener('keyup', function(e) {
        if ((e.keyCode === 27) && (document.getElementsByClassName(options.openClass).length > 0)) {
          e.stopPropagation();
          closeModal();
        }
      });
    }

    if ((options.closeOnOverlay) && (overlay)) {
      overlay.addEventListener('click', function() {
        closeModal();
      });
    }
  }

  function openModal() {
    if (options.openCallback) {
      options.openCallback(modalEl);
    }

    modalEl.classList.add(options.openClass);
    if (overlay) overlay.classList.add(overlayShowClass);

    if (overlay) overlay.classList.add(overlayShowClass);

    hideScroll();
  }

  function closeModal() {
    modalEl.classList.remove(options.openClass);
    if (options.closeCallback) {
      options.closeCallback(modalEl);
    }

    if (overlay) overlay.classList.remove(overlayShowClass);
    setTimeout(showScroll, 300);
  }

  function _drawOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'modal__overlay';
    modalInner.insertBefore(overlay, modalInner.firstChild);
  }

  function hideScroll() {
    _body._scrollTop = window.pageYOffset;
    _body.style.position = 'fixed';

    if (_hasScrollbar()) {
      var scrollbarSize = _getScrollbarSize();

      _body.style.width = 'calc(100% - ' +  scrollbarSize +'px)';
    } else {
      _body.style.width = '100%';
    }
    _body.style.height = 'calc(100% + ' + _body._scrollTop +'px)';
    _body.style.top = -_body._scrollTop + 'px';
  }

  function showScroll() {
    _body.style.top = '';
    _body.style.position = '';
    _body.style.width = '';
    _body.style.height = '';
    window.scroll(0, _body._scrollTop);
    _body._scrollTop = 0;
  }

  function _hasScrollbar() {
    return _body.scrollHeight > _body.clientHeight;
  }

  function _getScrollbarSize() {
    var outer = document.createElement('div');

    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps

    _body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;

    outer.style.overflow = 'scroll';

    var inner = document.createElement('div');

    inner.style.width = '100%';
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    outer.parentNode.removeChild(outer);
    return widthNoScroll - widthWithScroll;
  }

  this.open = function() {
    openModal();
  }
  this.close = function() {
    closeModal();
  }
}
