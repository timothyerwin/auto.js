(function($) {
  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        o.handler();
      }
    }
  };
})(jQuery);

(function($) {
  $.fn.center = function() {
    this.css("position", "absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
      $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
      $(window).scrollLeft()) + "px");
    return this;
  };
})(jQuery);

/* Riot 1.0.1, @license MIT, (c) 2014 Muut Inc + contributors */
(function(riot) {
  "use strict";

  riot.observable = function(el) {
    var callbacks = {},
      slice = [].slice;

    el.on = function(events, fn) {
      if (typeof fn === "function") {
        events.replace(/[^\s]+/g, function(name, pos) {
          (callbacks[name] = callbacks[name] || []).push(fn);
          fn.typed = pos > 0;
        });
      }
      return el;
    };

    el.off = function(events, fn) {
      if (events == "*") callbacks = {};
      else if (fn) {
        var arr = callbacks[events];
        for (var i = 0, cb;
          (cb = arr && arr[i]); ++i) {
          if (cb === fn) arr.splice(i, 1);
        }
      } else {
        events.replace(/[^\s]+/g, function(name) {
          callbacks[name] = [];
        });
      }
      return el;
    };

    // only single event supported
    el.one = function(name, fn) {
      if (fn) fn.one = true;
      return el.on(name, fn);
    };

    el.trigger = function(name) {
      var args = slice.call(arguments, 1),
        fns = callbacks[name] || [];

      for (var i = 0, fn;
        (fn = fns[i]); ++i) {
        if (!fn.busy) {
          fn.busy = true;
          fn.apply(el, fn.typed ? [name].concat(args) : args);
          if (fn.one) {
            fns.splice(i, 1);
            i--;
          }
          fn.busy = false;
        }
      }

      return el;
    };

    return el;

  };

})(typeof top == "object" ? window.riot = {} : exports);
