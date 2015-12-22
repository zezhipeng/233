(function() {
  (function(factory) {
    if (typeof define === "function" && define.amd) {
      define(["jquery"], factory);
    } else {
      factory(jQuery);
    }
  })(function($) {
    $.fn.extend({
      filesize: function(options) {
        var opts, self;
        self = $.fn.filesize;
        opts = $.extend({}, self.default_options, options);
        return $(this).each(function(i, el) {
          return self.init(el, opts);
        });
      }
    });
    return $.extend($.fn.filesize, {
      default_options: {
        abbr: true
      },
      init: function(el, opts) {
        return this.humanize(el, opts);
      },
      humanize: function(el, opts) {
        var err, output, size;
        try {
          size = parseInt($(el).html());
          output = "";
          if (size != null) {
            output = this._humanize(size, opts);
          }
          if (output != null) {
            return $(el).html(output);
          }
        } catch (_error) {
          err = _error;
          return void 0;
        }
      },
      _humanize: function(size, opts) {
        var abbr, i;
        abbr = opts != null ? opts.abbr : void 0;
        i = Math.floor(Math.log(size) / Math.log(1024));
        if ((size === 0) || (parseInt(size) === 0)) {
          return "0 kB";
        } else if (isNaN(i) || (!isFinite(size)) || (size === Number.POSITIVE_INFINITY) || (size === Number.NEGATIVE_INFINITY) || (size == null) || (size < 0)) {
          console.info("Throwing error");
          throw Error("" + size + " did not compute to a valid number to be humanized.");
        } else {
          if (abbr === true) {
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["B", "kB", "MB", "GB", "TB", "PB"][i];
          } else {
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["bytes", "kilobytes", "megabytes", "gigabytes", "terabytes", "petabytes"][i];
          }
        }
      },
      log: function(msg) {
        return console.log(msg);
      }
    });
  });

}).call(this);

//# sourceMappingURL=jquery.filesize.js.map
