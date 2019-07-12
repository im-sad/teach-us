// Form helpers
function btnStartLoad(btn) {
  btn.classList.add('has-load');
}

function btnEndLoad(btn) {
  btn.classList.remove('has-load');
}


// TODO: replace this functions to validate.js
function fieldAddError(field) {
  field.classList.add('has-error');
  field.parentNode.classList.add('has-error');
}

function fieldRemoveError(field) {
  field.classList.remove('has-error');
  field.parentNode.classList.remove('has-error');
}

function isEmailValid(input) {
  var mailRegex = /^([a-z0-9_\.\+-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/i;

  return mailRegex.test(input.value);
}

function isFieldRequired(field) {
  if (field.attributes['required']) return true;
  else return false;
}

function isFieldEmpty(field) {
  if (field.value === '') return true;
  else return false;
}


// Show form errors (validate.js)
function showErrors(errors, fields) {
  for (var i = 0; i < fields.length; i++) {
    showErrorsForInput(fields[i], errors && errors[fields[i].name]);
  }
}

function showErrorsForInput(input, errors) {
  var formField = closestParent(input.parentNode, 'field');

  if (!formField) return;

  //var messages = document.createElement('div');
  //messages.classList.add('field__error');
  //formField.appendChild(messages);

  resetformField(formField);

  if (errors) {
    input.classList.add('has-error');

    errors.forEach(function(error){
      showError(error);
      //addError(messages, error);
    });
  } else {
    input.classList.remove('has-error');
    clearAllMsgs();
  }
}

function closestParent(child, className) {
  if (!child || child == document) {
    return null;
  }

  if (child.classList.contains(className)) {
    return child;
  } else {
    return closestParent(child.parentNode, className);
  }
}

function resetformField(formField) {
  formField.classList.remove('has-error');
  //TODO: remove prev message
}

function addError(messages, error) {
  var block = document.createElement('p');
  block.classList.add('help-block');
  block.classList.add('error');
  block.innerText = error;
  messages.appendChild(block);
}
/*
 * forEach Polyfill
 */
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}
/*!
 * validate.js 0.13.1
 *
 * (c) 2013-2019 Nicklas Ansman, 2013 Wrapp
 * Validate.js may be freely distributed under the MIT license.
 * For all details and documentation:
 * http://validatejs.org/
 */

(function(exports, module, define) {
  "use strict";

  // The main function that calls the validators specified by the constraints.
  // The options are the following:
  //   - format (string) - An option that controls how the returned value is formatted
  //     * flat - Returns a flat array of just the error messages
  //     * grouped - Returns the messages grouped by attribute (default)
  //     * detailed - Returns an array of the raw validation data
  //   - fullMessages (boolean) - If `true` (default) the attribute name is prepended to the error.
  //
  // Please note that the options are also passed to each validator.
  var validate = function(attributes, constraints, options) {
    options = v.extend({}, v.options, options);

    var results = v.runValidations(attributes, constraints, options)
      , attr
      , validator;

    if (results.some(function(r) { return v.isPromise(r.error); })) {
      throw new Error("Use validate.async if you want support for promises");
    }
    return validate.processValidationResults(results, options);
  };

  var v = validate;

  // Copies over attributes from one or more sources to a single destination.
  // Very much similar to underscore's extend.
  // The first argument is the target object and the remaining arguments will be
  // used as sources.
  v.extend = function(obj) {
    [].slice.call(arguments, 1).forEach(function(source) {
      for (var attr in source) {
        obj[attr] = source[attr];
      }
    });
    return obj;
  };

  v.extend(validate, {
    // This is the version of the library as a semver.
    // The toString function will allow it to be coerced into a string
    version: {
      major: 0,
      minor: 13,
      patch: 1,
      metadata: null,
      toString: function() {
        var version = v.format("%{major}.%{minor}.%{patch}", v.version);
        if (!v.isEmpty(v.version.metadata)) {
          version += "+" + v.version.metadata;
        }
        return version;
      }
    },

    // Below is the dependencies that are used in validate.js

    // The constructor of the Promise implementation.
    // If you are using Q.js, RSVP or any other A+ compatible implementation
    // override this attribute to be the constructor of that promise.
    // Since jQuery promises aren't A+ compatible they won't work.
    Promise: typeof Promise !== "undefined" ? Promise : /* istanbul ignore next */ null,

    EMPTY_STRING_REGEXP: /^\s*$/,

    // Runs the validators specified by the constraints object.
    // Will return an array of the format:
    //     [{attribute: "<attribute name>", error: "<validation result>"}, ...]
    runValidations: function(attributes, constraints, options) {
      var results = []
        , attr
        , validatorName
        , value
        , validators
        , validator
        , validatorOptions
        , error;

      if (v.isDomElement(attributes) || v.isJqueryElement(attributes)) {
        attributes = v.collectFormValues(attributes);
      }

      // Loops through each constraints, finds the correct validator and run it.
      for (attr in constraints) {
        value = v.getDeepObjectValue(attributes, attr);
        // This allows the constraints for an attribute to be a function.
        // The function will be called with the value, attribute name, the complete dict of
        // attributes as well as the options and constraints passed in.
        // This is useful when you want to have different
        // validations depending on the attribute value.
        validators = v.result(constraints[attr], value, attributes, attr, options, constraints);

        for (validatorName in validators) {
          validator = v.validators[validatorName];

          if (!validator) {
            error = v.format("Unknown validator %{name}", {name: validatorName});
            throw new Error(error);
          }

          validatorOptions = validators[validatorName];
          // This allows the options to be a function. The function will be
          // called with the value, attribute name, the complete dict of
          // attributes as well as the options and constraints passed in.
          // This is useful when you want to have different
          // validations depending on the attribute value.
          validatorOptions = v.result(validatorOptions, value, attributes, attr, options, constraints);
          if (!validatorOptions) {
            continue;
          }
          results.push({
            attribute: attr,
            value: value,
            validator: validatorName,
            globalOptions: options,
            attributes: attributes,
            options: validatorOptions,
            error: validator.call(validator,
                value,
                validatorOptions,
                attr,
                attributes,
                options)
          });
        }
      }

      return results;
    },

    // Takes the output from runValidations and converts it to the correct
    // output format.
    processValidationResults: function(errors, options) {
      errors = v.pruneEmptyErrors(errors, options);
      errors = v.expandMultipleErrors(errors, options);
      errors = v.convertErrorMessages(errors, options);

      var format = options.format || "grouped";

      if (typeof v.formatters[format] === 'function') {
        errors = v.formatters[format](errors);
      } else {
        throw new Error(v.format("Unknown format %{format}", options));
      }

      return v.isEmpty(errors) ? undefined : errors;
    },

    // Runs the validations with support for promises.
    // This function will return a promise that is settled when all the
    // validation promises have been completed.
    // It can be called even if no validations returned a promise.
    async: function(attributes, constraints, options) {
      options = v.extend({}, v.async.options, options);

      var WrapErrors = options.wrapErrors || function(errors) {
        return errors;
      };

      // Removes unknown attributes
      if (options.cleanAttributes !== false) {
        attributes = v.cleanAttributes(attributes, constraints);
      }

      var results = v.runValidations(attributes, constraints, options);

      return new v.Promise(function(resolve, reject) {
        v.waitForResults(results).then(function() {
          var errors = v.processValidationResults(results, options);
          if (errors) {
            reject(new WrapErrors(errors, options, attributes, constraints));
          } else {
            resolve(attributes);
          }
        }, function(err) {
          reject(err);
        });
      });
    },

    single: function(value, constraints, options) {
      options = v.extend({}, v.single.options, options, {
        format: "flat",
        fullMessages: false
      });
      return v({single: value}, {single: constraints}, options);
    },

    // Returns a promise that is resolved when all promises in the results array
    // are settled. The promise returned from this function is always resolved,
    // never rejected.
    // This function modifies the input argument, it replaces the promises
    // with the value returned from the promise.
    waitForResults: function(results) {
      // Create a sequence of all the results starting with a resolved promise.
      return results.reduce(function(memo, result) {
        // If this result isn't a promise skip it in the sequence.
        if (!v.isPromise(result.error)) {
          return memo;
        }

        return memo.then(function() {
          return result.error.then(function(error) {
            result.error = error || null;
          });
        });
      }, new v.Promise(function(r) { r(); })); // A resolved promise
    },

    // If the given argument is a call: function the and: function return the value
    // otherwise just return the value. Additional arguments will be passed as
    // arguments to the function.
    // Example:
    // ```
    // result('foo') // 'foo'
    // result(Math.max, 1, 2) // 2
    // ```
    result: function(value) {
      var args = [].slice.call(arguments, 1);
      if (typeof value === 'function') {
        value = value.apply(null, args);
      }
      return value;
    },

    // Checks if the value is a number. This function does not consider NaN a
    // number like many other `isNumber` functions do.
    isNumber: function(value) {
      return typeof value === 'number' && !isNaN(value);
    },

    // Returns false if the object is not a function
    isFunction: function(value) {
      return typeof value === 'function';
    },

    // A simple check to verify that the value is an integer. Uses `isNumber`
    // and a simple modulo check.
    isInteger: function(value) {
      return v.isNumber(value) && value % 1 === 0;
    },

    // Checks if the value is a boolean
    isBoolean: function(value) {
      return typeof value === 'boolean';
    },

    // Uses the `Object` function to check if the given argument is an object.
    isObject: function(obj) {
      return obj === Object(obj);
    },

    // Simply checks if the object is an instance of a date
    isDate: function(obj) {
      return obj instanceof Date;
    },

    // Returns false if the object is `null` of `undefined`
    isDefined: function(obj) {
      return obj !== null && obj !== undefined;
    },

    // Checks if the given argument is a promise. Anything with a `then`
    // function is considered a promise.
    isPromise: function(p) {
      return !!p && v.isFunction(p.then);
    },

    isJqueryElement: function(o) {
      return o && v.isString(o.jquery);
    },

    isDomElement: function(o) {
      if (!o) {
        return false;
      }

      if (!o.querySelectorAll || !o.querySelector) {
        return false;
      }

      if (v.isObject(document) && o === document) {
        return true;
      }

      // http://stackoverflow.com/a/384380/699304
      /* istanbul ignore else */
      if (typeof HTMLElement === "object") {
        return o instanceof HTMLElement;
      } else {
        return o &&
          typeof o === "object" &&
          o !== null &&
          o.nodeType === 1 &&
          typeof o.nodeName === "string";
      }
    },

    isEmpty: function(value) {
      var attr;

      // Null and undefined are empty
      if (!v.isDefined(value)) {
        return true;
      }

      // functions are non empty
      if (v.isFunction(value)) {
        return false;
      }

      // Whitespace only strings are empty
      if (v.isString(value)) {
        return v.EMPTY_STRING_REGEXP.test(value);
      }

      // For arrays we use the length property
      if (v.isArray(value)) {
        return value.length === 0;
      }

      // Dates have no attributes but aren't empty
      if (v.isDate(value)) {
        return false;
      }

      // If we find at least one property we consider it non empty
      if (v.isObject(value)) {
        for (attr in value) {
          return false;
        }
        return true;
      }

      return false;
    },

    // Formats the specified strings with the given values like so:
    // ```
    // format("Foo: %{foo}", {foo: "bar"}) // "Foo bar"
    // ```
    // If you want to write %{...} without having it replaced simply
    // prefix it with % like this `Foo: %%{foo}` and it will be returned
    // as `"Foo: %{foo}"`
    format: v.extend(function(str, vals) {
      if (!v.isString(str)) {
        return str;
      }
      return str.replace(v.format.FORMAT_REGEXP, function(m0, m1, m2) {
        if (m1 === '%') {
          return "%{" + m2 + "}";
        } else {
          return String(vals[m2]);
        }
      });
    }, {
      // Finds %{key} style patterns in the given string
      FORMAT_REGEXP: /(%?)%\{([^\}]+)\}/g
    }),

    // "Prettifies" the given string.
    // Prettifying means replacing [.\_-] with spaces as well as splitting
    // camel case words.
    prettify: function(str) {
      if (v.isNumber(str)) {
        // If there are more than 2 decimals round it to two
        if ((str * 100) % 1 === 0) {
          return "" + str;
        } else {
          return parseFloat(Math.round(str * 100) / 100).toFixed(2);
        }
      }

      if (v.isArray(str)) {
        return str.map(function(s) { return v.prettify(s); }).join(", ");
      }

      if (v.isObject(str)) {
        if (!v.isDefined(str.toString)) {
          return JSON.stringify(str);
        }

        return str.toString();
      }

      // Ensure the string is actually a string
      str = "" + str;

      return str
        // Splits keys separated by periods
        .replace(/([^\s])\.([^\s])/g, '$1 $2')
        // Removes backslashes
        .replace(/\\+/g, '')
        // Replaces - and - with space
        .replace(/[_-]/g, ' ')
        // Splits camel cased words
        .replace(/([a-z])([A-Z])/g, function(m0, m1, m2) {
          return "" + m1 + " " + m2.toLowerCase();
        })
        .toLowerCase();
    },

    stringifyValue: function(value, options) {
      var prettify = options && options.prettify || v.prettify;
      return prettify(value);
    },

    isString: function(value) {
      return typeof value === 'string';
    },

    isArray: function(value) {
      return {}.toString.call(value) === '[object Array]';
    },

    // Checks if the object is a hash, which is equivalent to an object that
    // is neither an array nor a function.
    isHash: function(value) {
      return v.isObject(value) && !v.isArray(value) && !v.isFunction(value);
    },

    contains: function(obj, value) {
      if (!v.isDefined(obj)) {
        return false;
      }
      if (v.isArray(obj)) {
        return obj.indexOf(value) !== -1;
      }
      return value in obj;
    },

    unique: function(array) {
      if (!v.isArray(array)) {
        return array;
      }
      return array.filter(function(el, index, array) {
        return array.indexOf(el) == index;
      });
    },

    forEachKeyInKeypath: function(object, keypath, callback) {
      if (!v.isString(keypath)) {
        return undefined;
      }

      var key = ""
        , i
        , escape = false;

      for (i = 0; i < keypath.length; ++i) {
        switch (keypath[i]) {
          case '.':
            if (escape) {
              escape = false;
              key += '.';
            } else {
              object = callback(object, key, false);
              key = "";
            }
            break;

          case '\\':
            if (escape) {
              escape = false;
              key += '\\';
            } else {
              escape = true;
            }
            break;

          default:
            escape = false;
            key += keypath[i];
            break;
        }
      }

      return callback(object, key, true);
    },

    getDeepObjectValue: function(obj, keypath) {
      if (!v.isObject(obj)) {
        return undefined;
      }

      return v.forEachKeyInKeypath(obj, keypath, function(obj, key) {
        if (v.isObject(obj)) {
          return obj[key];
        }
      });
    },

    // This returns an object with all the values of the form.
    // It uses the input name as key and the value as value
    // So for example this:
    // <input type="text" name="email" value="foo@bar.com" />
    // would return:
    // {email: "foo@bar.com"}
    collectFormValues: function(form, options) {
      var values = {}
        , i
        , j
        , input
        , inputs
        , option
        , value;

      if (v.isJqueryElement(form)) {
        form = form[0];
      }

      if (!form) {
        return values;
      }

      options = options || {};

      inputs = form.querySelectorAll("input[name], textarea[name]");
      for (i = 0; i < inputs.length; ++i) {
        input = inputs.item(i);

        if (v.isDefined(input.getAttribute("data-ignored"))) {
          continue;
        }

        var name = input.name.replace(/\./g, "\\\\.");
        value = v.sanitizeFormValue(input.value, options);
        if (input.type === "number") {
          value = value ? +value : null;
        } else if (input.type === "checkbox") {
          if (input.attributes.value) {
            if (!input.checked) {
              value = values[name] || null;
            }
          } else {
            value = input.checked;
          }
        } else if (input.type === "radio") {
          if (!input.checked) {
            value = values[name] || null;
          }
        }
        values[name] = value;
      }

      inputs = form.querySelectorAll("select[name]");
      for (i = 0; i < inputs.length; ++i) {
        input = inputs.item(i);
        if (v.isDefined(input.getAttribute("data-ignored"))) {
          continue;
        }

        if (input.multiple) {
          value = [];
          for (j in input.options) {
            option = input.options[j];
             if (option && option.selected) {
              value.push(v.sanitizeFormValue(option.value, options));
            }
          }
        } else {
          var _val = typeof input.options[input.selectedIndex] !== 'undefined' ? input.options[input.selectedIndex].value : /* istanbul ignore next */ '';
          value = v.sanitizeFormValue(_val, options);
        }
        values[input.name] = value;
      }

      return values;
    },

    sanitizeFormValue: function(value, options) {
      if (options.trim && v.isString(value)) {
        value = value.trim();
      }

      if (options.nullify !== false && value === "") {
        return null;
      }
      return value;
    },

    capitalize: function(str) {
      if (!v.isString(str)) {
        return str;
      }
      return str[0].toUpperCase() + str.slice(1);
    },

    // Remove all errors who's error attribute is empty (null or undefined)
    pruneEmptyErrors: function(errors) {
      return errors.filter(function(error) {
        return !v.isEmpty(error.error);
      });
    },

    // In
    // [{error: ["err1", "err2"], ...}]
    // Out
    // [{error: "err1", ...}, {error: "err2", ...}]
    //
    // All attributes in an error with multiple messages are duplicated
    // when expanding the errors.
    expandMultipleErrors: function(errors) {
      var ret = [];
      errors.forEach(function(error) {
        // Removes errors without a message
        if (v.isArray(error.error)) {
          error.error.forEach(function(msg) {
            ret.push(v.extend({}, error, {error: msg}));
          });
        } else {
          ret.push(error);
        }
      });
      return ret;
    },

    // Converts the error mesages by prepending the attribute name unless the
    // message is prefixed by ^
    convertErrorMessages: function(errors, options) {
      options = options || {};

      var ret = []
        , prettify = options.prettify || v.prettify;
      errors.forEach(function(errorInfo) {
        var error = v.result(errorInfo.error,
            errorInfo.value,
            errorInfo.attribute,
            errorInfo.options,
            errorInfo.attributes,
            errorInfo.globalOptions);

        if (!v.isString(error)) {
          ret.push(errorInfo);
          return;
        }

        if (error[0] === '^') {
          error = error.slice(1);
        } else if (options.fullMessages !== false) {
          error = v.capitalize(prettify(errorInfo.attribute)) + " " + error;
        }
        error = error.replace(/\\\^/g, "^");
        error = v.format(error, {
          value: v.stringifyValue(errorInfo.value, options)
        });
        ret.push(v.extend({}, errorInfo, {error: error}));
      });
      return ret;
    },

    // In:
    // [{attribute: "<attributeName>", ...}]
    // Out:
    // {"<attributeName>": [{attribute: "<attributeName>", ...}]}
    groupErrorsByAttribute: function(errors) {
      var ret = {};
      errors.forEach(function(error) {
        var list = ret[error.attribute];
        if (list) {
          list.push(error);
        } else {
          ret[error.attribute] = [error];
        }
      });
      return ret;
    },

    // In:
    // [{error: "<message 1>", ...}, {error: "<message 2>", ...}]
    // Out:
    // ["<message 1>", "<message 2>"]
    flattenErrorsToArray: function(errors) {
      return errors
        .map(function(error) { return error.error; })
        .filter(function(value, index, self) {
          return self.indexOf(value) === index;
        });
    },

    cleanAttributes: function(attributes, whitelist) {
      function whitelistCreator(obj, key, last) {
        if (v.isObject(obj[key])) {
          return obj[key];
        }
        return (obj[key] = last ? true : {});
      }

      function buildObjectWhitelist(whitelist) {
        var ow = {}
          , lastObject
          , attr;
        for (attr in whitelist) {
          if (!whitelist[attr]) {
            continue;
          }
          v.forEachKeyInKeypath(ow, attr, whitelistCreator);
        }
        return ow;
      }

      function cleanRecursive(attributes, whitelist) {
        if (!v.isObject(attributes)) {
          return attributes;
        }

        var ret = v.extend({}, attributes)
          , w
          , attribute;

        for (attribute in attributes) {
          w = whitelist[attribute];

          if (v.isObject(w)) {
            ret[attribute] = cleanRecursive(ret[attribute], w);
          } else if (!w) {
            delete ret[attribute];
          }
        }
        return ret;
      }

      if (!v.isObject(whitelist) || !v.isObject(attributes)) {
        return {};
      }

      whitelist = buildObjectWhitelist(whitelist);
      return cleanRecursive(attributes, whitelist);
    },

    exposeModule: function(validate, root, exports, module, define) {
      if (exports) {
        if (module && module.exports) {
          exports = module.exports = validate;
        }
        exports.validate = validate;
      } else {
        root.validate = validate;
        if (validate.isFunction(define) && define.amd) {
          define([], function () { return validate; });
        }
      }
    },

    warn: function(msg) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[validate.js] " + msg);
      }
    },

    error: function(msg) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[validate.js] " + msg);
      }
    }
  });

  validate.validators = {
    // Presence validates that the value isn't empty
    presence: function(value, options) {
      options = v.extend({}, this.options, options);
      if (options.allowEmpty !== false ? !v.isDefined(value) : v.isEmpty(value)) {
        return options.message || this.message || "can't be blank";
      }
    },
    length: function(value, options, attribute) {
      // Empty values are allowed
      if (!v.isDefined(value)) {
        return;
      }

      options = v.extend({}, this.options, options);

      var is = options.is
        , maximum = options.maximum
        , minimum = options.minimum
        , tokenizer = options.tokenizer || function(val) { return val; }
        , err
        , errors = [];

      value = tokenizer(value);
      var length = value.length;
      if(!v.isNumber(length)) {
        return options.message || this.notValid || "has an incorrect length";
      }

      // Is checks
      if (v.isNumber(is) && length !== is) {
        err = options.wrongLength ||
          this.wrongLength ||
          "is the wrong length (should be %{count} characters)";
        errors.push(v.format(err, {count: is}));
      }

      if (v.isNumber(minimum) && length < minimum) {
        err = options.tooShort ||
          this.tooShort ||
          "is too short (minimum is %{count} characters)";
        errors.push(v.format(err, {count: minimum}));
      }

      if (v.isNumber(maximum) && length > maximum) {
        err = options.tooLong ||
          this.tooLong ||
          "is too long (maximum is %{count} characters)";
        errors.push(v.format(err, {count: maximum}));
      }

      if (errors.length > 0) {
        return options.message || errors;
      }
    },
    numericality: function(value, options, attribute, attributes, globalOptions) {
      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }

      options = v.extend({}, this.options, options);

      var errors = []
        , name
        , count
        , checks = {
            greaterThan:          function(v, c) { return v > c; },
            greaterThanOrEqualTo: function(v, c) { return v >= c; },
            equalTo:              function(v, c) { return v === c; },
            lessThan:             function(v, c) { return v < c; },
            lessThanOrEqualTo:    function(v, c) { return v <= c; },
            divisibleBy:          function(v, c) { return v % c === 0; }
          }
        , prettify = options.prettify ||
          (globalOptions && globalOptions.prettify) ||
          v.prettify;

      // Strict will check that it is a valid looking number
      if (v.isString(value) && options.strict) {
        var pattern = "^-?(0|[1-9]\\d*)";
        if (!options.onlyInteger) {
          pattern += "(\\.\\d+)?";
        }
        pattern += "$";

        if (!(new RegExp(pattern).test(value))) {
          return options.message ||
            options.notValid ||
            this.notValid ||
            this.message ||
            "must be a valid number";
        }
      }

      // Coerce the value to a number unless we're being strict.
      if (options.noStrings !== true && v.isString(value) && !v.isEmpty(value)) {
        value = +value;
      }

      // If it's not a number we shouldn't continue since it will compare it.
      if (!v.isNumber(value)) {
        return options.message ||
          options.notValid ||
          this.notValid ||
          this.message ||
          "is not a number";
      }

      // Same logic as above, sort of. Don't bother with comparisons if this
      // doesn't pass.
      if (options.onlyInteger && !v.isInteger(value)) {
        return options.message ||
          options.notInteger ||
          this.notInteger ||
          this.message ||
          "must be an integer";
      }

      for (name in checks) {
        count = options[name];
        if (v.isNumber(count) && !checks[name](value, count)) {
          // This picks the default message if specified
          // For example the greaterThan check uses the message from
          // this.notGreaterThan so we capitalize the name and prepend "not"
          var key = "not" + v.capitalize(name);
          var msg = options[key] ||
            this[key] ||
            this.message ||
            "must be %{type} %{count}";

          errors.push(v.format(msg, {
            count: count,
            type: prettify(name)
          }));
        }
      }

      if (options.odd && value % 2 !== 1) {
        errors.push(options.notOdd ||
            this.notOdd ||
            this.message ||
            "must be odd");
      }
      if (options.even && value % 2 !== 0) {
        errors.push(options.notEven ||
            this.notEven ||
            this.message ||
            "must be even");
      }

      if (errors.length) {
        return options.message || errors;
      }
    },
    datetime: v.extend(function(value, options) {
      if (!v.isFunction(this.parse) || !v.isFunction(this.format)) {
        throw new Error("Both the parse and format functions needs to be set to use the datetime/date validator");
      }

      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }

      options = v.extend({}, this.options, options);

      var err
        , errors = []
        , earliest = options.earliest ? this.parse(options.earliest, options) : NaN
        , latest = options.latest ? this.parse(options.latest, options) : NaN;

      value = this.parse(value, options);

      // 86400000 is the number of milliseconds in a day, this is used to remove
      // the time from the date
      if (isNaN(value) || options.dateOnly && value % 86400000 !== 0) {
        err = options.notValid ||
          options.message ||
          this.notValid ||
          "must be a valid date";
        return v.format(err, {value: arguments[0]});
      }

      if (!isNaN(earliest) && value < earliest) {
        err = options.tooEarly ||
          options.message ||
          this.tooEarly ||
          "must be no earlier than %{date}";
        err = v.format(err, {
          value: this.format(value, options),
          date: this.format(earliest, options)
        });
        errors.push(err);
      }

      if (!isNaN(latest) && value > latest) {
        err = options.tooLate ||
          options.message ||
          this.tooLate ||
          "must be no later than %{date}";
        err = v.format(err, {
          date: this.format(latest, options),
          value: this.format(value, options)
        });
        errors.push(err);
      }

      if (errors.length) {
        return v.unique(errors);
      }
    }, {
      parse: null,
      format: null
    }),
    date: function(value, options) {
      options = v.extend({}, options, {dateOnly: true});
      return v.validators.datetime.call(v.validators.datetime, value, options);
    },
    format: function(value, options) {
      if (v.isString(options) || (options instanceof RegExp)) {
        options = {pattern: options};
      }

      options = v.extend({}, this.options, options);

      var message = options.message || this.message || "is invalid"
        , pattern = options.pattern
        , match;

      // Empty values are allowed
      if (!v.isDefined(value)) {
        return;
      }
      if (!v.isString(value)) {
        return message;
      }

      if (v.isString(pattern)) {
        pattern = new RegExp(options.pattern, options.flags);
      }
      match = pattern.exec(value);
      if (!match || match[0].length != value.length) {
        return message;
      }
    },
    inclusion: function(value, options) {
      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }
      if (v.isArray(options)) {
        options = {within: options};
      }
      options = v.extend({}, this.options, options);
      if (v.contains(options.within, value)) {
        return;
      }
      var message = options.message ||
        this.message ||
        "^%{value} is not included in the list";
      return v.format(message, {value: value});
    },
    exclusion: function(value, options) {
      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }
      if (v.isArray(options)) {
        options = {within: options};
      }
      options = v.extend({}, this.options, options);
      if (!v.contains(options.within, value)) {
        return;
      }
      var message = options.message || this.message || "^%{value} is restricted";
      if (v.isString(options.within[value])) {
        value = options.within[value];
      }
      return v.format(message, {value: value});
    },
    email: v.extend(function(value, options) {
      options = v.extend({}, this.options, options);
      var message = options.message || this.message || "is not a valid email";
      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }
      if (!v.isString(value)) {
        return message;
      }
      if (!this.PATTERN.exec(value)) {
        return message;
      }
    }, {
      PATTERN: /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i
    }),
    equality: function(value, options, attribute, attributes, globalOptions) {
      if (!v.isDefined(value)) {
        return;
      }

      if (v.isString(options)) {
        options = {attribute: options};
      }
      options = v.extend({}, this.options, options);
      var message = options.message ||
        this.message ||
        "is not equal to %{attribute}";

      if (v.isEmpty(options.attribute) || !v.isString(options.attribute)) {
        throw new Error("The attribute must be a non empty string");
      }

      var otherValue = v.getDeepObjectValue(attributes, options.attribute)
        , comparator = options.comparator || function(v1, v2) {
          return v1 === v2;
        }
        , prettify = options.prettify ||
          (globalOptions && globalOptions.prettify) ||
          v.prettify;

      if (!comparator(value, otherValue, options, attribute, attributes)) {
        return v.format(message, {attribute: prettify(options.attribute)});
      }
    },
    // A URL validator that is used to validate URLs with the ability to
    // restrict schemes and some domains.
    url: function(value, options) {
      if (!v.isDefined(value)) {
        return;
      }

      options = v.extend({}, this.options, options);

      var message = options.message || this.message || "is not a valid url"
        , schemes = options.schemes || this.schemes || ['http', 'https']
        , allowLocal = options.allowLocal || this.allowLocal || false
        , allowDataUrl = options.allowDataUrl || this.allowDataUrl || false;
      if (!v.isString(value)) {
        return message;
      }

      // https://gist.github.com/dperini/729294
      var regex =
        "^" +
        // protocol identifier
        "(?:(?:" + schemes.join("|") + ")://)" +
        // user:pass authentication
        "(?:\\S+(?::\\S*)?@)?" +
        "(?:";

      var tld = "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))";

      if (allowLocal) {
        tld += "?";
      } else {
        regex +=
          // IP address exclusion
          // private & local networks
          "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
          "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
          "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})";
      }

      regex +=
          // IP address dotted notation octets
          // excludes loopback network 0.0.0.0
          // excludes reserved space >= 224.0.0.0
          // excludes network & broacast addresses
          // (first & last IP address of each class)
          "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
          "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
          "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
        "|" +
          // host name
          "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
          // domain name
          "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
          tld +
        ")" +
        // port number
        "(?::\\d{2,5})?" +
        // resource path
        "(?:[/?#]\\S*)?" +
      "$";

      if (allowDataUrl) {
        // RFC 2397
        var mediaType = "\\w+\\/[-+.\\w]+(?:;[\\w=]+)*";
        var urlchar = "[A-Za-z0-9-_.!~\\*'();\\/?:@&=+$,%]*";
        var dataurl = "data:(?:"+mediaType+")?(?:;base64)?,"+urlchar;
        regex = "(?:"+regex+")|(?:^"+dataurl+"$)";
      }

      var PATTERN = new RegExp(regex, 'i');
      if (!PATTERN.exec(value)) {
        return message;
      }
    },
    type: v.extend(function(value, originalOptions, attribute, attributes, globalOptions) {
      if (v.isString(originalOptions)) {
        originalOptions = {type: originalOptions};
      }

      if (!v.isDefined(value)) {
        return;
      }

      var options = v.extend({}, this.options, originalOptions);

      var type = options.type;
      if (!v.isDefined(type)) {
        throw new Error("No type was specified");
      }

      var check;
      if (v.isFunction(type)) {
        check = type;
      } else {
        check = this.types[type];
      }

      if (!v.isFunction(check)) {
        throw new Error("validate.validators.type.types." + type + " must be a function.");
      }

      if (!check(value, options, attribute, attributes, globalOptions)) {
        var message = originalOptions.message ||
          this.messages[type] ||
          this.message ||
          options.message ||
          (v.isFunction(type) ? "must be of the correct type" : "must be of type %{type}");

        if (v.isFunction(message)) {
          message = message(value, originalOptions, attribute, attributes, globalOptions);
        }

        return v.format(message, {attribute: v.prettify(attribute), type: type});
      }
    }, {
      types: {
        object: function(value) {
          return v.isObject(value) && !v.isArray(value);
        },
        array: v.isArray,
        integer: v.isInteger,
        number: v.isNumber,
        string: v.isString,
        date: v.isDate,
        boolean: v.isBoolean
      },
      messages: {}
    })
  };

  validate.formatters = {
    detailed: function(errors) {return errors;},
    flat: v.flattenErrorsToArray,
    grouped: function(errors) {
      var attr;

      errors = v.groupErrorsByAttribute(errors);
      for (attr in errors) {
        errors[attr] = v.flattenErrorsToArray(errors[attr]);
      }
      return errors;
    },
    constraint: function(errors) {
      var attr;
      errors = v.groupErrorsByAttribute(errors);
      for (attr in errors) {
        errors[attr] = errors[attr].map(function(result) {
          return result.validator;
        }).sort();
      }
      return errors;
    }
  };

  validate.exposeModule(validate, this, exports, module, define);
}).call(this,
        typeof exports !== 'undefined' ? /* istanbul ignore next */ exports : null,
        typeof module !== 'undefined' ? /* istanbul ignore next */ module : null,
        typeof define !== 'undefined' ? /* istanbul ignore next */ define : null);

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
      var stepsBtns = testingBlock.querySelectorAll('[data-to-step]'), j = stepsBtns.length;
      var stepperBlock = document.getElementById('js-test-steps');
      var testingChecked = 0;
      var testingLimit;
      var testingResult = {};
      var testingVariants;

      // Init steps
      while (j--) {
        stepsBtns[j].addEventListener('click', function() {
          initStep(this.dataset.toStep);
        });
      }

      initStep('0');

      function initStep(step) {
        var stepContainer = document.getElementById('step-' + (+step - 1));
        var stepContainerNext;

        if (stepContainer) {
          stepContainerNext = document.getElementById('step-' + step);
        } else {
          stepContainer = document.getElementById('step-' + step);
        }

        switch(step) {
          case '0':
            testingVariants = stepContainer.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);
            break;

          case '1':
            if (testingChecked < testingLimit) {
              showLimitMsg(testingChecked, testingLimit);
              return;
            }

            testingResult['step1'] = getVars(testingVariants);

            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);

            testingChecked = 0;
            break;

          case '2':
            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);

            testingVariants = stepContainerNext.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);
            setStep(2);
            testingChecked = 0;
            break;

          case '3':
            if (testingChecked < testingLimit) {
              showLimitMsg(testingChecked, testingLimit);
              return;
            }

            testingResult['step2'] = getVars(testingVariants);

            stepContainer.style.display = 'none';
            DOMAnimations.fadeIn(stepContainerNext);

            testingVariants = stepContainerNext.getElementsByClassName('js-test-vars')[0];
            testingLimit = initVars(testingVariants);

            testingChecked = 0;
            setStep(3);
            break;

          case 'finish':
            if (testingChecked < testingLimit) {
              showLimitMsg(testingChecked, testingLimit);
              return;
            }

            testingResult['step3'] = getVars(testingVariants);
            sendTesting(testingResult);
            break;

          default:
            break;
        }


        //FUNC
        function sendTesting(data) {
          var finishBtn = document.getElementById('js-test-finish');
          var xmlhttp = new XMLHttpRequest();

          if (finishBtn) finishBtn.classList.add('has-load');

          xmlhttp.open('POST', '/survey_answers', true);
          xmlhttp.setRequestHeader('Content-Type', 'application/json');
          xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
          xmlhttp.send(JSON.stringify(data));

          xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState !== 4) return;

            if (xmlhttp.status === 200 || xmlhttp.status === 201) {
              window.location = '/profile.html';
            } else {
              showError('Something went wrong');
              if (finishBtn) finishBtn.classList.remove('has-load');
            }
          }
        }

        function showLimitMsg(checked, limit) {
          if (checked < limit) {
            showWarning('Choose up to ' + (limit - checked) + ' more options');
            return false;
          }
        }

        function setStep(step) {
          if (!step) return;

          var items = stepperBlock.querySelectorAll('[data-step]');

          for (var i = 0; i < items.length; i++) {
            if (items[i].dataset.step == step) {
              items[i].classList.add('is-active');
            } else {
              items[i].classList.remove('is-active');
            }
          }
        }
  
        function getVars(scope) {
          var varsItems = scope.querySelectorAll('input[type="checkbox"]:checked');
          var array = [];

          for (var i = 0; i < varsItems.length; i++) {
            array.push(varsItems[i].value);
          }

          return array;
        }

        function initVars(scope) {
          if (!scope) return;

          var varsLimit = scope.dataset.max;
          var varsItems = scope.querySelectorAll('input[type="checkbox"]');

          for (var i = 0; i < varsItems.length; i++) {
            varsItems[i].addEventListener('change', function (e) {
              var validateResult = validateVariants(varsItems, varsLimit);

              if (!validateResult) e.target.checked = false;
            });
          }

          return varsLimit;
        }

        function validateVariants(items, max) {
          var questionNum = checkedSum(items);

          if (questionNum > max) {
            showWarning('Maximum ' + max + ' option');
            return false;
          } else return true;
        }

        function checkedSum(items) {
          if (!items) return false;

          var checkedItems = 0;

          for (var l = 0; l < items.length; l++) {
            if (items[l].checked) checkedItems++;
          }

          testingChecked = checkedItems;
          return checkedItems;
        }
      }


    // Main form
    var regForm = document.getElementById('js-fastreg');

    if (regForm) {
      var regFormInputs = regForm.getElementsByTagName('input');
      var regFormBtn = regForm.getElementsByClassName('btn')[0];

      regFormBtn.addEventListener('click', function(e) {
        e.preventDefault();

        for (var k = 0; k < regFormInputs.length; k++) {
          validateInput(regFormInputs[k]);
        }
        
        if (isFormValid(regForm)) {
          var formData = createInputsObj(regFormInputs);
          sendFormData(formData, '/users/registrations', this);
        }
      });


      function sendFormData(data, url, btn) {
        var xmlhttp = new XMLHttpRequest();

        btnStartLoad(btn);

        xmlhttp.open('POST', url, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
        xmlhttp.send(JSON.stringify(data));

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState !== 4) return;

          if (xmlhttp.status === 200 || xmlhttp.status === 201) {
            testingBlock.classList.add('is-step2');
          } else if (xmlhttp.status === 422) {
            var response = JSON.parse(xmlhttp.responseText);

            if (response.errors.email.filter((obj) => obj.predicate == 'not_unique').length > 0) {
              showWarning('An account with this email already exists. Please log in');
            }
          } else {
            return false;
          }

          btnEndLoad(btn);
        }
      }

      function createInputsObj(collection) {
        var obj = {};

        for (var i = 0; i < collection.length; i++) {
          if (collection[i].type === 'checkbox' && !collection[i].checked) {
            //
          } else {
            obj[collection[i].name] = collection[i].value;
          }
        }

        return obj;
      }


      function isFormValid(form) {
        if (form.getElementsByClassName('has-error').length < 1) return true;
      }

      function validateInput(input) {
        if (!input) return;

        var inputType = input.getAttribute('type');

        switch (inputType) {
          case 'email':
            if (isFieldEmpty(input) && isFieldRequired(input)) {
              fieldAddError(input);
            } else if (!isEmailValid(input)) {
              fieldAddError(input);
              showError('Wrong email format');
            } else {
              fieldRemoveError(input);
            }

            break;
          case 'checkbox':
            if (!input.checked && isFieldRequired(input)) {
              fieldAddError(input);
              showError('To continue you must agree with terms of Service and Privacy Policy');
            } else {
              fieldRemoveError(input);
            }

            break;
          default:
            break;
        }
      }


    }
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
    var constraintsPass = {
      current_password: {
        presence: true,
        length: {
          minimum: 8
        }
      },
      password: {
        presence: true,
        equality: {
          attribute: "current_password",
          message: "^The passwords does not match"
        }
      }
    };
    var constraintsPhone = {
      phone: {
        presence: true,
        length: {
          minimum: 6,
          maximum: 20
        },
        format: {
          pattern: /^[+]*[\s0-9]{0,4}[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\.0-9]*$/,
          message: "is not a phone number"
        }
      }
    };

    // Change phone
    if (editOption) {
      editValue(editOption);
    }

    // Change pass
    if (formChangePass) {
      var formChangePassBtn = formChangePass.getElementsByClassName('btn')[0];

      formChangePass.addEventListener('submit', function(e) {
        e.preventDefault();

        var that = this;
        var formErrors = validate(that, constraintsPass);
        var formFields = that.querySelectorAll('input[name]');

        showErrors(formErrors || {}, formFields);

        if (!formErrors && formChangePassBtn) {
          var passData = createDataObj(formFields);

          btnStartLoad(formChangePassBtn);

          saveSettings('/users/registrations/set_password', passData, function(status, errors) {
            btnEndLoad(formChangePassBtn);

            if (status) {
              showWarning('Password changed');
            } else {
              var errorText = 'Something went wrong'

              if (errors.current_password.filter((obj) => obj.predicate == 'is_wrong').length > 0) {
                errorText = 'Current password is wrong'
              }

              showError(errorText);
            }
          });
        }
      });
    }


    function editValue(scope) {
      if (!scope) return;

      var currentVal = scope.querySelector('[data-val]');
      var edit = scope.getElementsByClassName('js-editval-change')[0];
      var field = scope.getElementsByClassName('js-editval-field')[0];
      var inputs = field.getElementsByTagName('input');
      var saveBtn = field.getElementsByTagName('button')[0];

      edit.addEventListener('click', function() {
        this.classList.add('is-hidden');
        currentVal.classList.add('is-hidden');
        field.classList.remove('is-hidden');
      });

      scope.addEventListener('submit', function(e) {
        e.preventDefault();

        var phoneErrors = validate(this, constraintsPhone);
        showErrors(phoneErrors || {}, this);

        if (!phoneErrors) {
          var phoneData = createDataObj(inputs);

          btnStartLoad(saveBtn);

          saveSettings('/users/registrations/set_phone', phoneData, function(status) {
            btnEndLoad(saveBtn);
            currentVal.classList.remove('is-hidden');
            edit.classList.remove('is-hidden');
            field.classList.add('is-hidden');

            if (status) {
              showWarning('Phone changed');
              currentVal.textContent = inputs[0].value;
            } else {
              showError('Something went wrong');
            }
          });
        }
      });
    }




    function saveSettings(url, data, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('PATCH', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
      xhr.send(JSON.stringify(data));

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;

        if (xhr.status === 200 || xhr.status === 201) {
          callback(true);
        } else {
          var response = JSON.parse(xhr.responseText);

          callback(false, response.errors);
        }
      }
    }

    function createDataObj(collection) {
      console.log(collection);
      var obj = {};

      for (var i = 0; i < collection.length; i++) {
        var el = collection[i];

        obj[el.name] = el.value;
      }

      return obj;
    }

  })();
});
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
  var closeBtn = modalEl.getElementsByClassName(options.closeButtonClass)[0];
  var overlayShowClass = 'modal__overlay--is-show';

  if (options.overlay) {
    var overlay = scope.getElementsByClassName('modal__overlay')[0];

    if (!overlay) {
      _drawOverlay();
    }
  }

  init();

  function init() {
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        closeModal();
      });
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

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  (function () {
    var signForm = document.getElementById('js-signin-form');

    if (signForm) {
      signForm.addEventListener('submit', function(e) {
        e.preventDefault();
        this.disableValidation = true;

        var inputsList = signForm.getElementsByTagName('input');

        formValidate(inputsList);

        if (isFormValid(this)) {
          var submitBtn = this.getElementsByTagName('button')[0];

          submitBtn.classList.add('has-load');

          var formData = getFormData(inputsList);
          sendData(formData , submitBtn);
        }
      });


      // Functions
      function getFormData(items) {
        var data = {};
        
        for (var k = 0; k < items.length; k++) {
          var name = items[k].name;
          var type = items[k].type;

          if (type === 'checkbox' && !items[k].checked) {
            continue;
          } else {
            data[name] = items[k].value;
          }
        }

        return data;
      }

      function isFormValid(form) {
        if (form.getElementsByClassName('has-error').length < 1) return true;
      }

      function formValidate(items) {
        if (!items) return;

        for (var i = 0; i < items.length; i++) {
          validateInput(items[i]);
        }
      }


      function validateInput(input) {
        if (!input) return;

        var inputType = input.getAttribute('type');

        switch (inputType) {
          case 'email':
            if (isFieldEmpty(input) && isFieldRequired(input)) {
              fieldAddError(input);
            } else if (!isEmailValid(input)) {
              fieldAddError(input);
              showError('Wrong email format');
            } else {
              fieldRemoveError(input);
            }

            break;

          default:
            if (isFieldEmpty(input) && isFieldRequired(input)) {
              fieldAddError(input);
            } else {
              fieldRemoveError(input);
            }

            break;
        }
      }


      function sendData(data, btn) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.open('POST', '/users/sign_in.json', true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
        xmlhttp.send(JSON.stringify({user: data}));

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState !== 4) return;

          if (xmlhttp.status === 200 || xmlhttp.status === 201) {
            // good
            window.location = '/profile.html';
          } else {
            // not good
            showError(JSON.parse(xmlhttp.response).error);
          }

          btn.classList.remove('has-load');
        }
      }
    }
  })();
});

/*
* iziToast | v1.4.0
* http://izitoast.marcelodolce.com
* by Marcelo Dolce.
*/
(function (root, factory) {
	if(typeof define === 'function' && define.amd) {
		define([], factory(root));
	} else if(typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.iziToast = factory(root);
	}
})(typeof global !== 'undefined' ? global : window || this.window || this.global, function (root) {

	'use strict';

	//
	// Variables
	//
	var $iziToast = {},
		PLUGIN_NAME = 'iziToast',
		BODY = document.querySelector('body'),
		ISMOBILE = (/Mobi/.test(navigator.userAgent)) ? true : false,
		ISCHROME = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
		ISFIREFOX = typeof InstallTrigger !== 'undefined',
		ACCEPTSTOUCH = 'ontouchstart' in document.documentElement,
		POSITIONS = ['bottomRight','bottomLeft','bottomCenter','topRight','topLeft','topCenter','center'],
		THEMES = {
			info: {
				color: 'blue',
				icon: 'ico-info'
			},
			success: {
				color: 'green',
				icon: 'ico-success'
			},
			warning: {
				color: 'orange',
				icon: 'ico-warning'
			},
			error: {
				color: 'red',
				icon: 'ico-error'
			},
			question: {
				color: 'yellow',
				icon: 'ico-question'
			}
		},
		MOBILEWIDTH = 568,
		CONFIG = {};

	$iziToast.children = {};

	// Default settings
	var defaults = {
		id: null, 
		class: '',
		title: '',
		titleColor: '',
		titleSize: '',
		titleLineHeight: '',
		message: '',
		messageColor: '',
		messageSize: '',
		messageLineHeight: '',
		backgroundColor: '',
		theme: 'light', // dark
		color: '', // blue, red, green, yellow
		icon: '',
		iconText: '',
		iconColor: '',
		iconUrl: null,
		image: '',
		imageWidth: 50,
		maxWidth: null,
		zindex: null,
		layout: 1,
		balloon: false,
		close: true,
		closeOnEscape: false,
		closeOnClick: false,
		displayMode: 0,
		position: 'bottomRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter, center
		target: '',
		targetFirst: true,
		timeout: 5000,
		rtl: false,
		animateInside: true,
		drag: true,
		pauseOnHover: true,
		resetOnHover: false,
		progressBar: true,
		progressBarColor: '',
		progressBarEasing: 'linear',
		overlay: false,
		overlayClose: false,
		overlayColor: 'rgba(0, 0, 0, 0.6)',
		transitionIn: 'fadeInUp', // bounceInLeft, bounceInRight, bounceInUp, bounceInDown, fadeIn, fadeInDown, fadeInUp, fadeInLeft, fadeInRight, flipInX
		transitionOut: 'fadeOut', // fadeOut, fadeOutUp, fadeOutDown, fadeOutLeft, fadeOutRight, flipOutX
		transitionInMobile: 'fadeInUp',
		transitionOutMobile: 'fadeOutDown',
		buttons: {},
		inputs: {},
		onOpening: function () {},
		onOpened: function () {},
		onClosing: function () {},
		onClosed: function () {}
	};

	//
	// Methods
	//


	/**
	 * Polyfill for remove() method
	 */
	if(!('remove' in Element.prototype)) {
	    Element.prototype.remove = function() {
	        if(this.parentNode) {
	            this.parentNode.removeChild(this);
	        }
	    };
	}

	/*
     * Polyfill for CustomEvent for IE >= 9
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
     */
    if(typeof window.CustomEvent !== 'function') {
        var CustomEventPolyfill = function (event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        CustomEventPolyfill.prototype = window.Event.prototype;

        window.CustomEvent = CustomEventPolyfill;
    }

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if(Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if(Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			if(collection){
				for (var i = 0, len = collection.length; i < len; i++) {
					callback.call(scope, collection[i], i, collection);
				}
			}
		}
	};

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function (defaults, options) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};


	/**
	 * Create a fragment DOM elements
	 * @private
	 */
	var createFragElem = function(htmlStr) {
		var frag = document.createDocumentFragment(),
			temp = document.createElement('div');
		temp.innerHTML = htmlStr;
		while (temp.firstChild) {
			frag.appendChild(temp.firstChild);
		}
		return frag;
	};


	/**
	 * Generate new ID
	 * @private
	 */
	var generateId = function(params) {
		var newId = btoa(encodeURIComponent(params));
		return newId.replace(/=/g, "");
	};


	/**
	 * Check if is a color
	 * @private
	 */
	var isColor = function(color){
		if( color.substring(0,1) == '#' || color.substring(0,3) == 'rgb' || color.substring(0,3) == 'hsl' ){
			return true;
		} else {
			return false;
		}
	};


	/**
	 * Check if is a Base64 string
	 * @private
	 */
	var isBase64 = function(str) {
	    try {
	        return btoa(atob(str)) == str;
	    } catch (err) {
	        return false;
	    }
	};


	/**
	 * Drag method of toasts
	 * @private
	 */
	var drag = function() {
	    
	    return {
	        move: function(toast, instance, settings, xpos) {

	        	var opacity,
	        		opacityRange = 0.3,
	        		distance = 180;
	            
	            if(xpos !== 0){
	            	
	            	toast.classList.add(PLUGIN_NAME+'-dragged');

	            	toast.style.transform = 'translateX('+xpos + 'px)';

		            if(xpos > 0){
		            	opacity = (distance-xpos) / distance;
		            	if(opacity < opacityRange){
							instance.hide(extend(settings, { transitionOut: 'fadeOutRight', transitionOutMobile: 'fadeOutRight' }), toast, 'drag');
						}
		            } else {
		            	opacity = (distance+xpos) / distance;
		            	if(opacity < opacityRange){
							instance.hide(extend(settings, { transitionOut: 'fadeOutLeft', transitionOutMobile: 'fadeOutLeft' }), toast, 'drag');
						}
		            }
					toast.style.opacity = opacity;
			
					if(opacity < opacityRange){

						if(ISCHROME || ISFIREFOX)
							toast.style.left = xpos+'px';

						toast.parentNode.style.opacity = opacityRange;

		                this.stopMoving(toast, null);
					}
	            }

				
	        },
	        startMoving: function(toast, instance, settings, e) {

	            e = e || window.event;
	            var posX = ((ACCEPTSTOUCH) ? e.touches[0].clientX : e.clientX),
	                toastLeft = toast.style.transform.replace('px)', '');
	                toastLeft = toastLeft.replace('translateX(', '');
	            var offsetX = posX - toastLeft;

				if(settings.transitionIn){
					toast.classList.remove(settings.transitionIn);
				}
				if(settings.transitionInMobile){
					toast.classList.remove(settings.transitionInMobile);
				}
				toast.style.transition = '';

	            if(ACCEPTSTOUCH) {
	                document.ontouchmove = function(e) {
	                    e.preventDefault();
	                    e = e || window.event;
	                    var posX = e.touches[0].clientX,
	                        finalX = posX - offsetX;
                        drag.move(toast, instance, settings, finalX);
	                };
	            } else {
	                document.onmousemove = function(e) {
	                    e.preventDefault();
	                    e = e || window.event;
	                    var posX = e.clientX,
	                        finalX = posX - offsetX;
                        drag.move(toast, instance, settings, finalX);
	                };
	            }

	        },
	        stopMoving: function(toast, e) {

	            if(ACCEPTSTOUCH) {
	                document.ontouchmove = function() {};
	            } else {
	            	document.onmousemove = function() {};
	            }

				toast.style.opacity = '';
				toast.style.transform = '';

	            if(toast.classList.contains(PLUGIN_NAME+'-dragged')){
	            	
	            	toast.classList.remove(PLUGIN_NAME+'-dragged');

					toast.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
					setTimeout(function() {
						toast.style.transition = '';
					}, 400);
	            }

	        }
	    };

	}();





	$iziToast.setSetting = function (ref, option, value) {

		$iziToast.children[ref][option] = value;

	};


	$iziToast.getSetting = function (ref, option) {

		return $iziToast.children[ref][option];

	};


	/**
	 * Destroy the current initialization.
	 * @public
	 */
	$iziToast.destroy = function () {

		forEach(document.querySelectorAll('.'+PLUGIN_NAME+'-overlay'), function(element, index) {
			element.remove();
		});

		forEach(document.querySelectorAll('.'+PLUGIN_NAME+'-wrapper'), function(element, index) {
			element.remove();
		});

		forEach(document.querySelectorAll('.'+PLUGIN_NAME), function(element, index) {
			element.remove();
		});

		this.children = {};

		// Remove event listeners
		document.removeEventListener(PLUGIN_NAME+'-opened', {}, false);
		document.removeEventListener(PLUGIN_NAME+'-opening', {}, false);
		document.removeEventListener(PLUGIN_NAME+'-closing', {}, false);
		document.removeEventListener(PLUGIN_NAME+'-closed', {}, false);
		document.removeEventListener('keyup', {}, false);

		// Reset variables
		CONFIG = {};
	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	$iziToast.settings = function (options) {

		// Destroy any existing initializations
		$iziToast.destroy();

		CONFIG = options;
		defaults = extend(defaults, options || {});
	};


	/**
	 * Building themes functions.
	 * @public
	 * @param {Object} options User settings
	 */
	forEach(THEMES, function (theme, name) {

		$iziToast[name] = function (options) {

			var settings = extend(CONFIG, options || {});
			settings = extend(theme, settings || {});

			this.show(settings);
		};

	});


	/**
	 * Do the calculation to move the progress bar
	 * @private
	 */
	$iziToast.progress = function (options, $toast, callback) {


		var that = this,
			ref = $toast.getAttribute('data-iziToast-ref'),
			settings = extend(this.children[ref], options || {}),
			$elem = $toast.querySelector('.'+PLUGIN_NAME+'-progressbar div');

	    return {
	        start: function() {

	        	if(typeof settings.time.REMAINING == 'undefined'){

	        		$toast.classList.remove(PLUGIN_NAME+'-reseted');

		        	if($elem !== null){
						$elem.style.transition = 'width '+ settings.timeout +'ms '+settings.progressBarEasing;
						$elem.style.width = '0%';
					}

		        	settings.time.START = new Date().getTime();
		        	settings.time.END = settings.time.START + settings.timeout;
					settings.time.TIMER = setTimeout(function() {

						clearTimeout(settings.time.TIMER);

						if(!$toast.classList.contains(PLUGIN_NAME+'-closing')){

							that.hide(settings, $toast, 'timeout');

							if(typeof callback === 'function'){
								callback.apply(that);
							}
						}

					}, settings.timeout);			
		        	that.setSetting(ref, 'time', settings.time);
	        	}
	        },
	        pause: function() {

	        	if(typeof settings.time.START !== 'undefined' && !$toast.classList.contains(PLUGIN_NAME+'-paused') && !$toast.classList.contains(PLUGIN_NAME+'-reseted')){

        			$toast.classList.add(PLUGIN_NAME+'-paused');

					settings.time.REMAINING = settings.time.END - new Date().getTime();

					clearTimeout(settings.time.TIMER);

					that.setSetting(ref, 'time', settings.time);

					if($elem !== null){
						var computedStyle = window.getComputedStyle($elem),
							propertyWidth = computedStyle.getPropertyValue('width');

						$elem.style.transition = 'none';
						$elem.style.width = propertyWidth;					
					}

					if(typeof callback === 'function'){
						setTimeout(function() {
							callback.apply(that);						
						}, 10);
					}
        		}
	        },
	        resume: function() {

				if(typeof settings.time.REMAINING !== 'undefined'){

					$toast.classList.remove(PLUGIN_NAME+'-paused');

		        	if($elem !== null){
						$elem.style.transition = 'width '+ settings.time.REMAINING +'ms '+settings.progressBarEasing;
						$elem.style.width = '0%';
					}

		        	settings.time.END = new Date().getTime() + settings.time.REMAINING;
					settings.time.TIMER = setTimeout(function() {

						clearTimeout(settings.time.TIMER);

						if(!$toast.classList.contains(PLUGIN_NAME+'-closing')){

							that.hide(settings, $toast, 'timeout');

							if(typeof callback === 'function'){
								callback.apply(that);
							}
						}


					}, settings.time.REMAINING);

					that.setSetting(ref, 'time', settings.time);
				} else {
					this.start();
				}
	        },
	        reset: function(){

				clearTimeout(settings.time.TIMER);

				delete settings.time.REMAINING;

				that.setSetting(ref, 'time', settings.time);

				$toast.classList.add(PLUGIN_NAME+'-reseted');

				$toast.classList.remove(PLUGIN_NAME+'-paused');

				if($elem !== null){
					$elem.style.transition = 'none';
					$elem.style.width = '100%';
				}

				if(typeof callback === 'function'){
					setTimeout(function() {
						callback.apply(that);						
					}, 10);
				}
	        }
	    };

	};


	/**
	 * Close the specific Toast
	 * @public
	 * @param {Object} options User settings
	 */
	$iziToast.hide = function (options, $toast, closedBy) {

		if(typeof $toast != 'object'){
			$toast = document.querySelector($toast);
		}		

		var that = this,
			settings = extend(this.children[$toast.getAttribute('data-iziToast-ref')], options || {});
			settings.closedBy = closedBy || null;

		delete settings.time.REMAINING;

		$toast.classList.add(PLUGIN_NAME+'-closing');

		// Overlay
		(function(){

			var $overlay = document.querySelector('.'+PLUGIN_NAME+'-overlay');
			if($overlay !== null){
				var refs = $overlay.getAttribute('data-iziToast-ref');		
					refs = refs.split(',');
				var index = refs.indexOf(String(settings.ref));

				if(index !== -1){
					refs.splice(index, 1);			
				}
				$overlay.setAttribute('data-iziToast-ref', refs.join());

				if(refs.length === 0){
					$overlay.classList.remove('fadeIn');
					$overlay.classList.add('fadeOut');
					setTimeout(function() {
						$overlay.remove();
					}, 700);
				}
			}

		})();

		if(settings.transitionIn){
			$toast.classList.remove(settings.transitionIn);
		} 

		if(settings.transitionInMobile){
			$toast.classList.remove(settings.transitionInMobile);
		}

		if(ISMOBILE || window.innerWidth <= MOBILEWIDTH){
			if(settings.transitionOutMobile)
				$toast.classList.add(settings.transitionOutMobile);
		} else {
			if(settings.transitionOut)
				$toast.classList.add(settings.transitionOut);
		}
		var H = $toast.parentNode.offsetHeight;
				$toast.parentNode.style.height = H+'px';
				$toast.style.pointerEvents = 'none';
		
		if(!ISMOBILE || window.innerWidth > MOBILEWIDTH){
			$toast.parentNode.style.transitionDelay = '0.2s';
		}

		try {
			var event = new CustomEvent(PLUGIN_NAME+'-closing', {detail: settings, bubbles: true, cancelable: true});
			document.dispatchEvent(event);
		} catch(ex){
			console.warn(ex);
		}

		setTimeout(function() {
			
			$toast.parentNode.style.height = '0px';
			$toast.parentNode.style.overflow = '';

			setTimeout(function(){
				
				delete that.children[settings.ref];

				$toast.parentNode.remove();

				try {
					var event = new CustomEvent(PLUGIN_NAME+'-closed', {detail: settings, bubbles: true, cancelable: true});
					document.dispatchEvent(event);
				} catch(ex){
					console.warn(ex);
				}

				if(typeof settings.onClosed !== 'undefined'){
					settings.onClosed.apply(null, [settings, $toast, closedBy]);
				}

			}, 1000);
		}, 200);


		if(typeof settings.onClosing !== 'undefined'){
			settings.onClosing.apply(null, [settings, $toast, closedBy]);
		}
	};

	/**
	 * Create and show the Toast
	 * @public
	 * @param {Object} options User settings
	 */
	$iziToast.show = function (options) {

		var that = this;

		// Merge user options with defaults
		var settings = extend(CONFIG, options || {});
			settings = extend(defaults, settings);
			settings.time = {};

		if(settings.id === null){
			settings.id = generateId(settings.title+settings.message+settings.color);
		}

		if(settings.displayMode === 1 || settings.displayMode == 'once'){
			try {
				if(document.querySelectorAll('.'+PLUGIN_NAME+'#'+settings.id).length > 0){
					return false;
				}
			} catch (exc) {
				console.warn('['+PLUGIN_NAME+'] Could not find an element with this selector: '+'#'+settings.id+'. Try to set an valid id.');
			}
		}

		if(settings.displayMode === 2 || settings.displayMode == 'replace'){
			try {
				forEach(document.querySelectorAll('.'+PLUGIN_NAME+'#'+settings.id), function(element, index) {
					that.hide(settings, element, 'replaced');
				});
			} catch (exc) {
				console.warn('['+PLUGIN_NAME+'] Could not find an element with this selector: '+'#'+settings.id+'. Try to set an valid id.');
			}
		}

		settings.ref = new Date().getTime() + Math.floor((Math.random() * 10000000) + 1);

		$iziToast.children[settings.ref] = settings;

		var $DOM = {
			body: document.querySelector('body'),
			overlay: document.createElement('div'),
			toast: document.createElement('div'),
			toastBody: document.createElement('div'),
			toastTexts: document.createElement('div'),
			toastCapsule: document.createElement('div'),
			cover: document.createElement('div'),
			buttons: document.createElement('div'),
			inputs: document.createElement('div'),
			icon: !settings.iconUrl ? document.createElement('i') : document.createElement('img'),
			wrapper: null
		};

		$DOM.toast.setAttribute('data-iziToast-ref', settings.ref);
		$DOM.toast.appendChild($DOM.toastBody);
		$DOM.toastCapsule.appendChild($DOM.toast);

		// CSS Settings
		(function(){

			$DOM.toast.classList.add(PLUGIN_NAME);
			$DOM.toast.classList.add(PLUGIN_NAME+'-opening');
			$DOM.toastCapsule.classList.add(PLUGIN_NAME+'-capsule');
			$DOM.toastBody.classList.add(PLUGIN_NAME + '-body');
			$DOM.toastTexts.classList.add(PLUGIN_NAME + '-texts');

			if(ISMOBILE || window.innerWidth <= MOBILEWIDTH){
				if(settings.transitionInMobile)
					$DOM.toast.classList.add(settings.transitionInMobile);
			} else {
				if(settings.transitionIn)
					$DOM.toast.classList.add(settings.transitionIn);
			}

			if(settings.class){
				var classes = settings.class.split(' ');
				forEach(classes, function (value, index) {
					$DOM.toast.classList.add(value);
				});
			}

			if(settings.id){ $DOM.toast.id = settings.id; }

			if(settings.rtl){
				$DOM.toast.classList.add(PLUGIN_NAME + '-rtl');
				$DOM.toast.setAttribute('dir', 'rtl');
			}

			if(settings.layout > 1){ $DOM.toast.classList.add(PLUGIN_NAME+'-layout'+settings.layout); }

			if(settings.balloon){ $DOM.toast.classList.add(PLUGIN_NAME+'-balloon'); }

			if(settings.maxWidth){
				if( !isNaN(settings.maxWidth) ){
					$DOM.toast.style.maxWidth = settings.maxWidth+'px';
				} else {
					$DOM.toast.style.maxWidth = settings.maxWidth;
				}
			}

			if(settings.theme !== '' || settings.theme !== 'light') {

				$DOM.toast.classList.add(PLUGIN_NAME+'-theme-'+settings.theme);
			}

			if(settings.color) { //#, rgb, rgba, hsl
				
				if( isColor(settings.color) ){
					$DOM.toast.style.background = settings.color;
				} else {
					$DOM.toast.classList.add(PLUGIN_NAME+'-color-'+settings.color);
				}
			}

			if(settings.backgroundColor) {
				$DOM.toast.style.background = settings.backgroundColor;
				if(settings.balloon){
					$DOM.toast.style.borderColor = settings.backgroundColor;				
				}
			}
		})();

		// Cover image
		(function(){
			if(settings.image) {
				$DOM.cover.classList.add(PLUGIN_NAME + '-cover');
				$DOM.cover.style.width = settings.imageWidth + 'px';

				if(isBase64(settings.image.replace(/ /g,''))){
					$DOM.cover.style.backgroundImage = 'url(data:image/png;base64,' + settings.image.replace(/ /g,'') + ')';
				} else {
					$DOM.cover.style.backgroundImage = 'url(' + settings.image + ')';
				}

				if(settings.rtl){
					$DOM.toastBody.style.marginRight = (settings.imageWidth + 10) + 'px';
				} else {
					$DOM.toastBody.style.marginLeft = (settings.imageWidth + 10) + 'px';				
				}
				$DOM.toast.appendChild($DOM.cover);
			}
		})();

		// Button close
		(function(){
			if(settings.close){
				
				$DOM.buttonClose = document.createElement('button');
				$DOM.buttonClose.type = 'button';
				$DOM.buttonClose.classList.add(PLUGIN_NAME + '-close');
				$DOM.buttonClose.addEventListener('click', function (e) {
					var button = e.target;
					that.hide(settings, $DOM.toast, 'button');
				});
				$DOM.toast.appendChild($DOM.buttonClose);
			} else {
				if(settings.rtl){
					$DOM.toast.style.paddingLeft = '18px';
				} else {
					$DOM.toast.style.paddingRight = '18px';
				}
			}
		})();

		// Progress Bar & Timeout
		(function(){

			if(settings.progressBar){
				$DOM.progressBar = document.createElement('div');
				$DOM.progressBarDiv = document.createElement('div');
				$DOM.progressBar.classList.add(PLUGIN_NAME + '-progressbar');
				$DOM.progressBarDiv.style.background = settings.progressBarColor;
				$DOM.progressBar.appendChild($DOM.progressBarDiv);
				$DOM.toast.appendChild($DOM.progressBar);
			}

			if(settings.timeout) {

				if(settings.pauseOnHover && !settings.resetOnHover){
					
					$DOM.toast.addEventListener('mouseenter', function (e) {
						that.progress(settings, $DOM.toast).pause();
					});
					$DOM.toast.addEventListener('mouseleave', function (e) {
						that.progress(settings, $DOM.toast).resume();
					});
				}

				if(settings.resetOnHover){

					$DOM.toast.addEventListener('mouseenter', function (e) {
						that.progress(settings, $DOM.toast).reset();
					});
					$DOM.toast.addEventListener('mouseleave', function (e) {
						that.progress(settings, $DOM.toast).start();
					});
				}
			}
		})();

		// Icon
		(function(){

			if(settings.iconUrl) {

				$DOM.icon.setAttribute('class', PLUGIN_NAME + '-icon');
				$DOM.icon.setAttribute('src', settings.iconUrl);

			} else if(settings.icon) {
				$DOM.icon.setAttribute('class', PLUGIN_NAME + '-icon ' + settings.icon);
				
				if(settings.iconText){
					$DOM.icon.appendChild(document.createTextNode(settings.iconText));
				}
				
				if(settings.iconColor){
					$DOM.icon.style.color = settings.iconColor;
				}				
			}

			if(settings.icon || settings.iconUrl) {

				if(settings.rtl){
					$DOM.toastBody.style.paddingRight = '33px';
				} else {
					$DOM.toastBody.style.paddingLeft = '33px';				
				}

				$DOM.toastBody.appendChild($DOM.icon);
			}

		})();

		// Title & Message
		(function(){
			if(settings.title.length > 0) {

				$DOM.strong = document.createElement('strong');
				$DOM.strong.classList.add(PLUGIN_NAME + '-title');
				$DOM.strong.appendChild(createFragElem(settings.title));
				$DOM.toastTexts.appendChild($DOM.strong);

				if(settings.titleColor) {
					$DOM.strong.style.color = settings.titleColor;
				}
				if(settings.titleSize) {
					if( !isNaN(settings.titleSize) ){
						$DOM.strong.style.fontSize = settings.titleSize+'px';
					} else {
						$DOM.strong.style.fontSize = settings.titleSize;
					}
				}
				if(settings.titleLineHeight) {
					if( !isNaN(settings.titleSize) ){
						$DOM.strong.style.lineHeight = settings.titleLineHeight+'px';
					} else {
						$DOM.strong.style.lineHeight = settings.titleLineHeight;
					}
				}
			}

			if(settings.message.length > 0) {

				$DOM.p = document.createElement('p');
				$DOM.p.classList.add(PLUGIN_NAME + '-message');
				$DOM.p.appendChild(createFragElem(settings.message));
				$DOM.toastTexts.appendChild($DOM.p);

				if(settings.messageColor) {
					$DOM.p.style.color = settings.messageColor;
				}
				if(settings.messageSize) {
					if( !isNaN(settings.titleSize) ){
						$DOM.p.style.fontSize = settings.messageSize+'px';
					} else {
						$DOM.p.style.fontSize = settings.messageSize;
					}
				}
				if(settings.messageLineHeight) {
					
					if( !isNaN(settings.titleSize) ){
						$DOM.p.style.lineHeight = settings.messageLineHeight+'px';
					} else {
						$DOM.p.style.lineHeight = settings.messageLineHeight;
					}
				}
			}

			if(settings.title.length > 0 && settings.message.length > 0) {
				if(settings.rtl){
					$DOM.strong.style.marginLeft = '10px';
				} else if(settings.layout !== 2 && !settings.rtl) {
					$DOM.strong.style.marginRight = '10px';	
				}
			}
		})();

		$DOM.toastBody.appendChild($DOM.toastTexts);

		// Inputs
		var $inputs;
		(function(){
			if(settings.inputs.length > 0) {

				$DOM.inputs.classList.add(PLUGIN_NAME + '-inputs');

				forEach(settings.inputs, function (value, index) {
					$DOM.inputs.appendChild(createFragElem(value[0]));

					$inputs = $DOM.inputs.childNodes;

					$inputs[index].classList.add(PLUGIN_NAME + '-inputs-child');

					if(value[3]){
						setTimeout(function() {
							$inputs[index].focus();
						}, 300);
					}

					$inputs[index].addEventListener(value[1], function (e) {
						var ts = value[2];
						return ts(that, $DOM.toast, this, e);
					});
				});
				$DOM.toastBody.appendChild($DOM.inputs);
			}
		})();

		// Buttons
		(function(){
			if(settings.buttons.length > 0) {

				$DOM.buttons.classList.add(PLUGIN_NAME + '-buttons');

				forEach(settings.buttons, function (value, index) {
					$DOM.buttons.appendChild(createFragElem(value[0]));

					var $btns = $DOM.buttons.childNodes;

					$btns[index].classList.add(PLUGIN_NAME + '-buttons-child');

					if(value[2]){
						setTimeout(function() {
							$btns[index].focus();
						}, 300);
					}

					$btns[index].addEventListener('click', function (e) {
						e.preventDefault();
						var ts = value[1];
						return ts(that, $DOM.toast, this, e, $inputs);
					});
				});
			}
			$DOM.toastBody.appendChild($DOM.buttons);
		})();

		if(settings.message.length > 0 && (settings.inputs.length > 0 || settings.buttons.length > 0)) {
			$DOM.p.style.marginBottom = '0';
		}

		if(settings.inputs.length > 0 || settings.buttons.length > 0){
			if(settings.rtl){
				$DOM.toastTexts.style.marginLeft = '10px';
			} else {
				$DOM.toastTexts.style.marginRight = '10px';
			}
			if(settings.inputs.length > 0 && settings.buttons.length > 0){
				if(settings.rtl){
					$DOM.inputs.style.marginLeft = '8px';
				} else {
					$DOM.inputs.style.marginRight = '8px';
				}
			}
		}

		// Wrap
		(function(){
			$DOM.toastCapsule.style.visibility = 'hidden';
			setTimeout(function() {
				var H = $DOM.toast.offsetHeight;
				var style = $DOM.toast.currentStyle || window.getComputedStyle($DOM.toast);
				var marginTop = style.marginTop;
					marginTop = marginTop.split('px');
					marginTop = parseInt(marginTop[0]);
				var marginBottom = style.marginBottom;
					marginBottom = marginBottom.split('px');
					marginBottom = parseInt(marginBottom[0]);

				$DOM.toastCapsule.style.visibility = '';
				$DOM.toastCapsule.style.height = (H+marginBottom+marginTop)+'px';

				setTimeout(function() {
					$DOM.toastCapsule.style.height = 'auto';
					if(settings.target){
						$DOM.toastCapsule.style.overflow = 'visible';
					}
				}, 500);

				if(settings.timeout) {
					that.progress(settings, $DOM.toast).start();
				}
			}, 100);
		})();

		// Target
		(function(){
			var position = settings.position;

			if(settings.target){

				$DOM.wrapper = document.querySelector(settings.target);
				$DOM.wrapper.classList.add(PLUGIN_NAME + '-target');

				if(settings.targetFirst) {
					$DOM.wrapper.insertBefore($DOM.toastCapsule, $DOM.wrapper.firstChild);
				} else {
					$DOM.wrapper.appendChild($DOM.toastCapsule);
				}

			} else {

				if( POSITIONS.indexOf(settings.position) == -1 ){
					console.warn('['+PLUGIN_NAME+'] Incorrect position.\nIt can be › ' + POSITIONS);
					return;
				}

				if(ISMOBILE || window.innerWidth <= MOBILEWIDTH){
					if(settings.position == 'bottomLeft' || settings.position == 'bottomRight' || settings.position == 'bottomCenter'){
						position = PLUGIN_NAME+'-wrapper-bottomCenter';
					}
					else if(settings.position == 'topLeft' || settings.position == 'topRight' || settings.position == 'topCenter'){
						position = PLUGIN_NAME+'-wrapper-topCenter';
					}
					else {
						position = PLUGIN_NAME+'-wrapper-center';
					}
				} else {
					position = PLUGIN_NAME+'-wrapper-'+position;
				}
				$DOM.wrapper = document.querySelector('.' + PLUGIN_NAME + '-wrapper.'+position);

				if(!$DOM.wrapper) {
					$DOM.wrapper = document.createElement('div');
					$DOM.wrapper.classList.add(PLUGIN_NAME + '-wrapper');
					$DOM.wrapper.classList.add(position);
					document.body.appendChild($DOM.wrapper);
				}
				if(settings.position == 'topLeft' || settings.position == 'topCenter' || settings.position == 'topRight'){
					$DOM.wrapper.insertBefore($DOM.toastCapsule, $DOM.wrapper.firstChild);
				} else {
					$DOM.wrapper.appendChild($DOM.toastCapsule);
				}
			}

			if(!isNaN(settings.zindex)) {
				$DOM.wrapper.style.zIndex = settings.zindex;
			} else {
				console.warn('['+PLUGIN_NAME+'] Invalid zIndex.');
			}
		})();

		// Overlay
		(function(){

			if(settings.overlay) {

				if( document.querySelector('.'+PLUGIN_NAME+'-overlay.fadeIn') !== null ){

					$DOM.overlay = document.querySelector('.'+PLUGIN_NAME+'-overlay');
					$DOM.overlay.setAttribute('data-iziToast-ref', $DOM.overlay.getAttribute('data-iziToast-ref') + ',' + settings.ref);

					if(!isNaN(settings.zindex) && settings.zindex !== null) {
						$DOM.overlay.style.zIndex = settings.zindex-1;
					}

				} else {

					$DOM.overlay.classList.add(PLUGIN_NAME+'-overlay');
					$DOM.overlay.classList.add('fadeIn');
					$DOM.overlay.style.background = settings.overlayColor;
					$DOM.overlay.setAttribute('data-iziToast-ref', settings.ref);
					if(!isNaN(settings.zindex) && settings.zindex !== null) {
						$DOM.overlay.style.zIndex = settings.zindex-1;
					}
					document.querySelector('body').appendChild($DOM.overlay);
				}

				if(settings.overlayClose) {

					$DOM.overlay.removeEventListener('click', {});
					$DOM.overlay.addEventListener('click', function (e) {
						that.hide(settings, $DOM.toast, 'overlay');
					});
				} else {
					$DOM.overlay.removeEventListener('click', {});
				}
			}			
		})();

		// Inside animations
		(function(){
			if(settings.animateInside){
				$DOM.toast.classList.add(PLUGIN_NAME+'-animateInside');
			
				var animationTimes = [200, 100, 300];
				if(settings.transitionIn == 'bounceInLeft' || settings.transitionIn == 'bounceInRight'){
					animationTimes = [400, 200, 400];
				}

				if(settings.title.length > 0) {
					setTimeout(function(){
						$DOM.strong.classList.add('slideIn');
					}, animationTimes[0]);
				}

				if(settings.message.length > 0) {
					setTimeout(function(){
						$DOM.p.classList.add('slideIn');
					}, animationTimes[1]);
				}

				if(settings.icon || settings.iconUrl) {
					setTimeout(function(){
						$DOM.icon.classList.add('revealIn');
					}, animationTimes[2]);
				}

				var counter = 150;
				if(settings.buttons.length > 0 && $DOM.buttons) {

					setTimeout(function(){

						forEach($DOM.buttons.childNodes, function(element, index) {

							setTimeout(function(){
								element.classList.add('revealIn');
							}, counter);
							counter = counter + 150;
						});

					}, settings.inputs.length > 0 ? 150 : 0);
				}

				if(settings.inputs.length > 0 && $DOM.inputs) {
					counter = 150;
					forEach($DOM.inputs.childNodes, function(element, index) {

						setTimeout(function(){
							element.classList.add('revealIn');
						}, counter);
						counter = counter + 150;
					});
				}
			}
		})();

		settings.onOpening.apply(null, [settings, $DOM.toast]);

		try {
			var event = new CustomEvent(PLUGIN_NAME + '-opening', {detail: settings, bubbles: true, cancelable: true});
			document.dispatchEvent(event);
		} catch(ex){
			console.warn(ex);
		}

		setTimeout(function() {

			$DOM.toast.classList.remove(PLUGIN_NAME+'-opening');
			$DOM.toast.classList.add(PLUGIN_NAME+'-opened');

			try {
				var event = new CustomEvent(PLUGIN_NAME + '-opened', {detail: settings, bubbles: true, cancelable: true});
				document.dispatchEvent(event);
			} catch(ex){
				console.warn(ex);
			}

			settings.onOpened.apply(null, [settings, $DOM.toast]);
		}, 1000);

		if(settings.drag){

			if(ACCEPTSTOUCH) {

			    $DOM.toast.addEventListener('touchstart', function(e) {
			        drag.startMoving(this, that, settings, e);
			    }, false);

			    $DOM.toast.addEventListener('touchend', function(e) {
			        drag.stopMoving(this, e);
			    }, false);
			} else {

			    $DOM.toast.addEventListener('mousedown', function(e) {
			    	e.preventDefault();
			        drag.startMoving(this, that, settings, e);
			    }, false);

			    $DOM.toast.addEventListener('mouseup', function(e) {
			    	e.preventDefault();
			        drag.stopMoving(this, e);
			    }, false);
			}
		}

		if(settings.closeOnEscape) {

			document.addEventListener('keyup', function (evt) {
				evt = evt || window.event;
				if(evt.keyCode == 27) {
				    that.hide(settings, $DOM.toast, 'esc');
				}
			});
		}

		if(settings.closeOnClick) {
			$DOM.toast.addEventListener('click', function (evt) {
				that.hide(settings, $DOM.toast, 'toast');
			});
		}

		that.toast = $DOM.toast;		
	};
	

	return $iziToast;
});
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("ScrollBooster", [], factory);
	else if(typeof exports === 'object')
		exports["ScrollBooster"] = factory();
	else
		root["ScrollBooster"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScrollBooster = function () {
  function ScrollBooster() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ScrollBooster);

    if (!props.viewport || !(props.viewport instanceof Element)) {
      console.error('"viewport" config property must be present and must be Element');
      return;
    }

    var defaults = {
      handle: props.viewport,
      content: props.viewport.children[0],
      bounce: true,
      friction: 0.05,
      bounceForce: 0.1,
      textSelection: false,
      onClick: function onClick() {},
      shouldScroll: function shouldScroll() {
        return true;
      },
      onUpdate: function onUpdate() {}
    };

    this.props = _extends({}, defaults, props);

    if (!this.props.content) {
      console.error('Viewport does not have any content');
      return;
    }

    this.viewport = {
      width: this.props.viewport.clientWidth,
      height: this.props.viewport.clientHeight
    };
    this.content = {
      width: getFullWidth(this.props.content),
      height: getFullHeight(this.props.content)
    };

    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.friction = 1 - this.props.friction;
    this.bounceForce = this.props.bounceForce;

    this.isDragging = false;
    this.dragStartPosition = { x: 0, y: 0 };
    this.dragOffsetPosition = _extends({}, this.dragStartPosition);
    this.dragPosition = _extends({}, this.position);

    this.isScrollEnabled = !!this.props.emulateScroll;
    this.isScrolling = false;
    this.scrollOffset = { x: 0, y: 0 };

    this.bounce = this.props.bounce;
    this.textSelection = this.props.textSelection;

    this.boundX = {
      from: Math.min(-this.content.width + this.viewport.width, 0),
      to: 0
    };
    this.boundY = {
      from: Math.min(-this.content.height + this.viewport.height, 0),
      to: 0
    };

    this.mode = {
      x: this.props.mode == 'x',
      y: this.props.mode == 'y',
      xy: this.props.mode !== 'x' && this.props.mode !== 'y'
    };

    this.isRunning = false;
    this.rafID = null;

    this.events = {};

    this.animate();
    this.handleEvents();
  }

  /**
   * Run update loop
   */


  _createClass(ScrollBooster, [{
    key: 'run',
    value: function run() {
      var _this = this;

      this.isRunning = true;
      cancelAnimationFrame(this.rafID);
      this.rafID = requestAnimationFrame(function () {
        return _this.animate();
      });
    }
  }, {
    key: 'animate',
    value: function animate() {
      var _this2 = this;

      if (!this.isRunning) {
        return;
      }
      this.update();
      this.notify();
      this.rafID = requestAnimationFrame(function () {
        return _this2.animate();
      });
    }
  }, {
    key: 'update',
    value: function update() {
      this.applyBoundForce();
      this.applyDragForce();
      this.applyScrollForce();

      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;

      if (!this.mode.y) {
        this.position.x += this.velocity.x;
      }
      if (!this.mode.x) {
        this.position.y += this.velocity.y;
      }

      // if bounce effect is disabled
      if (!this.bounce || this.isScrolling) {
        this.position.x = Math.max(Math.min(this.position.x, this.boundX.to), this.boundX.from);
        this.position.y = Math.max(Math.min(this.position.y, this.boundY.to), this.boundY.from);
      }

      // stop update loop if nothing moves
      if (!this.isDragging && !this.isScrolling && Math.abs(this.velocity.x) < 0.1 && Math.abs(this.velocity.y) < 0.1) {
        this.isRunning = false;
      }
    }
  }, {
    key: 'applyForce',
    value: function applyForce(force) {
      this.velocity.x += force.x;
      this.velocity.y += force.y;
    }

    /**
     * Apply force for bounce effect
     */

  }, {
    key: 'applyBoundForce',
    value: function applyBoundForce() {
      if (!this.bounce) {
        return;
      }
      if (this.isDragging) {
        return;
      }

      var pastLeft = this.position.x < this.boundX.from;
      var pastRight = this.position.x > this.boundX.to;
      var pastTop = this.position.y < this.boundY.from;
      var pastBottom = this.position.y > this.boundY.to;

      var resultForce = { x: 0, y: 0

        // scrolled past left of right viewport boundaries
      };if (pastLeft || pastRight) {
        var bound = pastLeft ? this.boundX.from : this.boundX.to;
        var distance = bound - this.position.x;

        var force = distance * this.bounceForce;
        var restX = this.position.x + (this.velocity.x + force) / (1 - this.friction);

        if (!(pastLeft && restX < this.boundX.from || pastRight && restX > this.boundX.to)) {
          force = distance * this.bounceForce - this.velocity.x;
        }

        resultForce.x = force;
      }

      // scrolled past top of bottom viewport boundaries
      if (pastTop || pastBottom) {
        var _bound = pastTop ? this.boundY.from : this.boundY.to;
        var _distance = _bound - this.position.y;

        var _force = _distance * this.bounceForce;
        var restY = this.position.y + (this.velocity.y + _force) / (1 - this.friction);

        if (!(pastTop && restY < this.boundY.from || pastBottom && restY > this.boundY.to)) {
          _force = _distance * this.bounceForce - this.velocity.y;
        }

        resultForce.y = _force;
      }

      this.applyForce(resultForce);
    }

    /**
     * Apply force to move content while dragging with mouse/touch
     */

  }, {
    key: 'applyDragForce',
    value: function applyDragForce() {
      if (!this.isDragging) {
        return;
      }
      var dragVelocity = {
        x: this.dragPosition.x - this.position.x,
        y: this.dragPosition.y - this.position.y
      };
      var dragForce = {
        x: dragVelocity.x - this.velocity.x,
        y: dragVelocity.y - this.velocity.y
      };

      this.applyForce(dragForce);
    }

    /**
     * Apply force to emulate mouse wheel
     */

  }, {
    key: 'applyScrollForce',
    value: function applyScrollForce() {
      if (!this.isScrolling) {
        return;
      }

      var scrollForce = {
        x: this.scrollOffset.x - this.velocity.x,
        y: this.scrollOffset.y - this.velocity.y
      };

      this.scrollOffset.x = 0;
      this.scrollOffset.y = 0;

      this.applyForce(scrollForce);
    }

    /**
     * Manual position setting
     */

  }, {
    key: 'setPosition',
    value: function setPosition() {
      var newPosition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.velocity.x = 0;
      this.velocity.y = 0;

      this.position.x = -newPosition.x || 0;
      this.position.y = -newPosition.y || 0;

      this.run();
    }

    /**
     * Get latest metrics and coordinates
     */

  }, {
    key: 'getUpdate',
    value: function getUpdate() {
      return {
        isRunning: this.isRunning,
        isDragging: this.isDragging,
        isScrolling: this.isScrolling,
        position: {
          x: -this.position.x,
          y: -this.position.y
        },
        dragOffsetPosition: this.dragOffsetPosition,
        viewport: _extends({}, this.viewport),
        content: _extends({}, this.content)
      };
    }
  }, {
    key: 'notify',
    value: function notify() {
      this.props.onUpdate(this.getUpdate());
    }
  }, {
    key: 'updateMetrics',
    value: function updateMetrics() {
      this.viewport.width = this.props.viewport.clientWidth;
      this.viewport.height = this.props.viewport.clientHeight;

      this.content.width = getFullWidth(this.props.content);
      this.content.height = getFullHeight(this.props.content);

      this.boundX.from = Math.min(-this.content.width + this.viewport.width, 0);
      this.boundY.from = Math.min(-this.content.height + this.viewport.height, 0);

      this.run();
    }
  }, {
    key: 'handleEvents',
    value: function handleEvents() {
      var _this3 = this;

      var vp = this.props.viewport;
      var scroll = { x: 0, y: 0 };
      var mousedown = { x: 0, y: 0 };

      var isTouch = false;

      var setDragPosition = function setDragPosition(event) {
        var pageX = void 0,
            pageY = void 0;

        if (isTouch) {
          pageX = event.touches[0].pageX;
          pageY = event.touches[0].pageY;
        } else {
          pageX = event.pageX;
          pageY = event.pageY;
        }

        _this3.dragOffsetPosition.x = pageX - mousedown.x;
        _this3.dragOffsetPosition.y = pageY - mousedown.y;

        _this3.dragPosition.x = _this3.dragStartPosition.x + _this3.dragOffsetPosition.x;
        _this3.dragPosition.y = _this3.dragStartPosition.y + _this3.dragOffsetPosition.y;

        if (!isTouch) {
          event.preventDefault();
        }
      };

      this.events.pointerdown = function (event) {
        var pageX = void 0,
            pageY = void 0,
            clientX = void 0,
            clientY = void 0;

        isTouch = !!(event.touches && event.touches[0]);

        if (isTouch) {
          pageX = event.touches[0].pageX;
          pageY = event.touches[0].pageY;
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else {
          pageX = event.pageX;
          pageY = event.pageY;
          clientX = event.clientX;
          clientY = event.clientY;
        }

        var rect = vp.getBoundingClientRect();

        // click on vertical scrollbar
        if (clientX - rect.left >= vp.clientLeft + vp.clientWidth) {
          return;
        }

        // click on horizontal scrollbar
        if (clientY - rect.top >= vp.clientTop + vp.clientHeight) {
          return;
        }

        if (!_this3.props.shouldScroll(_this3.getUpdate(), event)) {
          return;
        }

        // text selection enabled
        if (_this3.textSelection) {
          var clickedNode = textNodeFromPoint(event.target, clientX, clientY);
          if (clickedNode) {
            return;
          } else {
            clearTextSelection();
          }
        }

        _this3.isDragging = true;

        if (scroll.x || scroll.y) {
          _this3.position.x = scroll.x;
          _this3.position.y = scroll.y;
          scroll.x = 0;
          scroll.y = 0;
        }
        mousedown.x = pageX;
        mousedown.y = pageY;
        _this3.dragStartPosition.x = _this3.position.x;
        _this3.dragStartPosition.y = _this3.position.y;

        setDragPosition(event);

        _this3.run();

        var pointerUp = void 0,
            removeEvents = void 0;

        removeEvents = function removeEvents(event) {
          _this3.isDragging = false;

          if (isTouch) {
            window.removeEventListener('touchmove', setDragPosition);
            window.removeEventListener('touchend', pointerUp);
          } else {
            window.removeEventListener('mousemove', setDragPosition);
            window.removeEventListener('mouseup', pointerUp);
          }
        };

        if (isTouch) {
          pointerUp = window.addEventListener('touchend', removeEvents);
          window.addEventListener('touchmove', setDragPosition);
        } else {
          pointerUp = window.addEventListener('mouseup', removeEvents);
          window.addEventListener('mousemove', setDragPosition);
        }
      };

      var scrollTimer = null;
      this.events.wheel = function (event) {
        _this3.velocity.x = 0;

        if (!_this3.isScrollEnabled) {
          return;
        }
        _this3.isScrolling = true;

        _this3.scrollOffset.x = -event.deltaX;
        _this3.scrollOffset.y = -event.deltaY;

        _this3.run();

        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
          return _this3.isScrolling = false;
        }, 80);

        event.preventDefault();
      };

      this.events.scroll = function (event) {
        var sl = _this3.props.viewport.scrollLeft;
        var st = _this3.props.viewport.scrollTop;
        if (Math.abs(_this3.position.x + sl) > 3) {
          _this3.position.x = -sl;
          _this3.velocity.x = 0;
        }
        if (Math.abs(_this3.position.y + st) > 3) {
          _this3.position.y = -st;
          _this3.velocity.y = 0;
        }
        scroll.x = -_this3.props.viewport.scrollLeft;
        scroll.y = -_this3.props.viewport.scrollTop;
      };

      this.events.click = function (event) {
        _this3.props.onClick(_this3.getUpdate(), event);
      };

      this.events.resize = this.updateMetrics.bind(this);

      this.props.handle.addEventListener('mousedown', this.events.pointerdown);
      this.props.handle.addEventListener('touchstart', this.events.pointerdown);
      this.props.handle.addEventListener('click', this.events.click);
      this.props.viewport.addEventListener('wheel', this.events.wheel);
      this.props.viewport.addEventListener('scroll', this.events.scroll);
      window.addEventListener('resize', this.events.resize);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.props.handle.removeEventListener('mousedown', this.events.pointerdown);
      this.props.handle.removeEventListener('touchstart', this.events.pointerdown);
      this.props.handle.removeEventListener('click', this.events.click);
      this.props.viewport.removeEventListener('wheel', this.events.wheel);
      this.props.viewport.removeEventListener('scroll', this.events.scroll);
      window.removeEventListener('resize', this.events.resize);
    }
  }]);

  return ScrollBooster;
}();

exports.default = ScrollBooster;


function getFullWidth(elem) {
  return Math.max(elem.offsetWidth, elem.scrollWidth);
}

function getFullHeight(elem) {
  return Math.max(elem.offsetHeight, elem.scrollHeight);
}

function textNodeFromPoint(element, x, y) {
  var node = void 0;
  var nodes = element.childNodes;
  var range = document.createRange();
  for (var i = 0; node = nodes[i], i < nodes.length; i++) {
    if (node.nodeType !== 3) continue;
    range.selectNodeContents(node);
    var rect = range.getBoundingClientRect();
    if (x >= rect.left && y >= rect.top && x <= rect.right && y <= rect.bottom) {
      return node;
    }
  }
  return false;
}

function clearTextSelection() {
  var sel = window.getSelection ? window.getSelection() : document.selection;
  if (sel) {
    if (sel.removeAllRanges) {
      sel.removeAllRanges();
    } else if (sel.empty) {
      sel.empty();
    }
  }
}
module.exports = exports['default'];

/***/ })
/******/ ]);
});
//# sourceMappingURL=scrollbooster.js.map
// Make active goal item visible
document.addEventListener('DOMContentLoaded', function() {
  'use strict';

   // TODO: use ES5 or Babel
  (function() {
    let goalsTimelines = document.getElementsByClassName('js-goals');

    for (let i = 0; i < goalsTimelines.length; i++) {
      let activePoint = goalsTimelines[i].getElementsByClassName('is-active')[0];
      let content = goalsTimelines[i].firstElementChild;

      let sb = new ScrollBooster({
        viewport: goalsTimelines[i],
        content: content,
        mode: 'x',
        onUpdate: (data)=> {
          content.style.transform = `translateX(${-data.position.x}px)`
        }
      });

      if (activePoint) {
        let rectLine = goalsTimelines[i].getBoundingClientRect();
        let rectPoint = activePoint.getBoundingClientRect();

        if (rectLine.width / 2 < activePoint.offsetLeft) {
          let offset = activePoint.offsetLeft + (rectPoint.width / 2) - (rectLine.width / 2);
          sb.setPosition({x: offset, y: 0});
        }
      }
    }
  })();

});

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

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  (function() {
    var stepsContainers = document.getElementsByClassName('js-config-step');
    var cfgForms = document.getElementsByClassName('js-config-form');
    var cfgSkip = document.getElementsByClassName('js-skip-config');
    var constraints = [
      {
        password: {
          presence: true,
          length: {
            minimum: 8,
            message: "must be at least 6 characters"
          }
        }
      },
      {
        phone: {
          presence: true,
          length: {
            minimum: 6,
            maximum: 20
          },
          format: {
            pattern: /^[+]*[\s0-9]{0,4}[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\.0-9]*$/,
            message: "is not a phone number"
          }
        }
      },
      {
        name: {
          presence: true,
        },
        lastname: {
          presence: true,
        },
        state: {
          presence: true,
        },
        city: {
          presence: true,
        },
        zip: {
          format: {
            pattern: "\\d{5}"
          }
        },
      }
    ];

    if (stepsContainers.length < 1) return;

    updateActiveContainer();

    // forms
    for (var i = 0; i < cfgForms.length; i++) {
      cfgForms[i].addEventListener('submit', function(e) {
        e.preventDefault();

        var that = this;
        var thatStep = +this.dataset.step - 1;
        var thatStepNext = +this.dataset.step;
        var stepUrl;

        //validate
        var formErrors = validate(that, constraints[thatStep]);
        //var error = validate(this, constraints, {fullMessages: false});
        var formFields = that.querySelectorAll('input[name], select[name]');

        showErrors(formErrors || {}, formFields);

        //submit
        if (!formErrors) {
          switch (thatStep) {
            case 0:
              stepUrl = '/users/registrations/set_password';
              break;
            case 1:
              stepUrl = '/users/registrations/set_phone';
              break;
            default:
              stepUrl = '/users/registrations';
          }

          formSubmit(that, stepUrl, formFields, function(status) {
            if (!status) return false;

            switch (thatStep) {
              case 2:
                window.location.href = "/profile.html";
                break;
              default:
                stepsContainers[thatStep].style.display = 'none';
                DOMAnimations.fadeIn(stepsContainers[thatStepNext], 300);
            }
          });
        }
      });
    }

    // skip links
    for (var j = 0; j < cfgSkip.length; j++) {
      cfgSkip[j].addEventListener('click', function(e) {
        e.preventDefault();
        var href = this.getAttribute('href');

        if (href) window.location.replace(href);
        updateActiveContainer();
      });
    }


    // Functions
    function updateActiveContainer() {
      var pageHash = window.location.hash.substr(1);

      for (var i = 0; i < stepsContainers.length; i++) {
        stepsContainers[i].style.display = 'none';
      }

      if (!pageHash) {
        DOMAnimations.fadeIn(stepsContainers[0], 300);
      } else if (pageHash === 'step2') {
        DOMAnimations.fadeIn(stepsContainers[1], 300);
      } else if (pageHash === 'step3') {
        DOMAnimations.fadeIn(stepsContainers[2], 300);
      }
    }

    function formSubmit(form, url, inputs, callback) {
      if (!form) return;

      var sendBtn = form.getElementsByClassName('btn')[0];
      var xmlhttp = new XMLHttpRequest();
      var data = createDataObj(inputs);

      if (sendBtn) {
        btnStartLoad(sendBtn);
      }

      xmlhttp.open('PATCH', url, true);
      xmlhttp.setRequestHeader('Content-Type', 'application/json');
      xmlhttp.setRequestHeader('X-CSRF-Token', Rails.csrfToken());
      xmlhttp.send(JSON.stringify(data));

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState !== 4) return;

        if (xmlhttp.status === 200 || xmlhttp.status === 201) {
          callback(true);
        } else {
          callback(false);
        }

        btnEndLoad(sendBtn);
      }
    }

    function createDataObj(collection) {
      var obj = {};

      for (var i = 0; i < collection.length; i++) {
        var el = collection[i];
        
        if (el.type === 'file') {
          var image = el.parentElement.getElementsByTagName('img')[0];

          if (image && image.src) obj[el.name] = image.src;
        } else {
          obj[el.name] = el.value;
        }
      }

      return obj;
    }

  })();

});
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Tabs
  (function() {
    var baseTabs = document.getElementsByClassName('js-tabs')[0];

    if (baseTabs) new Tabs(baseTabs);
  })();


  // Modals
  (function() {
    initBaseModals();

    function initBaseModals() {
      
      var modals = document.getElementsByClassName('js-modal');
      for (var i = 0; i < modals.length; i++) {
        initModal(modals[i]);
      }
    }

    function initModal(modalElement) {
      var modalPlugin = new Modal(modalElement);
      var modalId =  modalElement.getAttribute('id');

      addButtonsEvent(modalPlugin);

      return modalPlugin;

      function addButtonsEvent(obj) {
        var modalBtns = document.querySelectorAll('[data-modal="'+ modalId +'"]');

        for (var j = 0; j < modalBtns.length; j++) {
          modalBtns[j].addEventListener('click', function() {
            obj.open();
            }, false);
        }
      }
    }
  })();
});

function showError(msg) {
  if (!msg) return;

  return iziToast.show({
    message: msg,
    color: 'red',
    theme: 'dark',
    position: 'topCenter',
    timeout: false,
    progressBar: false,
    animateInside: false,
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutUp',
    displayMode: 'replace'
  });
}

function showWarning(msg) {
  if (!msg) return;

  return iziToast.show({
    message: msg,
    color: 'yellow',
    position: 'topCenter',
    timeout: 1800,
    progressBar: false,
    close: false,
    animateInside: false,
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutUp'
  });
}

function clearAllMsgs() {
  iziToast.destroy();
}