(function($){
  function trim(el) {
    return (''.trim) ? el.val().trim() : $.trim(el.val());
  }
  $.fn.isHappy = function (config) {
    var fields = [], item;

    function getError(error) {
      return $('<span id="'+error.id+'" class="unhappyMessage">'+error.message+'</span>');
    }
    function handleSubmit() {
      var errors = false, i, l;
      for (i = 0, l = fields.length; i < l; i += 1) {
        if (!fields[i].testValid()) {
          errors = true;
        }
      }
      if (errors) {
        return false;
      } else if (config.testMode) {
        if (window.console) console.warn('would have submitted');
        return false;
      }
    }
    function isFunction (obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    }
    function processField(opts, selector) {
      var field = $(selector),
        error = {
          message: opts.message,
          id: selector.slice(1) + '_unhappy'
        },
        errorEl = $(error.id).length > 0 ? $(error.id) : getError(error);

      fields.push(field);
      field.testValid = function () {
        var val,
          el = $(this),
          gotFunc,
          error = false,
          temp,
          required = el.get(0).attributes.getNamedItem('required') || opts.required,
          password = (field.attr('type') === 'password'),
          arg = isFunction(opts.arg) ? opts.arg() : opts.arg;

        // clean it or trim it
        if (isFunction(opts.clean)) {
          val = opts.clean(el.val());
        } else if (!opts.trim && !password) {
          val = trim(el);
        } else {
          val = el.val();
        }

        // write it back to the field
        el.val(val)

        // get the value
        gotFunc = (val.length > 0 && isFunction(opts.test));

        // check if we've got an error on our hands
        if (required && val.length === 0) {
          error = true;
        } else if (gotFunc) {
          error = !opts.test(val, arg);
        }

        if (error) {
          el.addClass('unhappy').before(errorEl);
          return false;
        } else {
          temp = errorEl.get(0);
          // this is for zepto
          if (temp.parentNode) {
            temp.parentNode.removeChild(temp);
          }
          el.removeClass('unhappy');
          return true;
        }
      };
      field.bind(config.when || 'blur', field.testValid);
    }

    for (item in config.fields) {
      processField(config.fields[item], item);
    }

    if (config.submitButton) {
      $(config.submitButton).click(handleSubmit);
    } else {
      this.bind('submit', handleSubmit);
    }
  }
})(this.jQuery || this.Zepto);
