var auto = auto || {};

(function(auto, $) {

  $.fn.autotabs = function(o, t) {
    return this.each(function() {
      this.tabs = {};
      this.tabs.settings = o;

      var tabs = $(this);

      var hidetabs = function() {
        $.each(tabs.find("li.active a"), function() {
          var a = $(this);
          var id = $(this).data("tab");
          var tab = $(id);

          a.parent().removeClass("active");

          tab.hide();

          if (o && o.hide)
            o.hide(id);
        });
      };

      var showtab = function(a) {
        var id = a.data("tab");
        var tab = $(id);

        hidetabs();

        a.parent().addClass("active");

        if(o && o.beforeShow){
          o.beforeShow(id, tab);
        }

        if(o && o.effect === 'fade'){
          tab.fadeIn();
        }else{
          tab.show();
        }

        if (o && o.show){
          o.show(id, tab);
        }
      };

      if (typeof o === 'string') {
        if (o === 'show') {
          var a = $('li a[data-tab="' + t + '"]');

          showtab(a);
        }
      }

      $.each(tabs.find("li a"), function() {
        var a = $(this);

        a.on("click", function() {
          showtab(a);
        });
      });

      $(tabs.find(".active a").data("tab")).show();
    });
  };

}(auto || {}, jQuery));
