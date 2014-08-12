var auto = (function(auto, $) {

  $.fn.autotabs = function(o) {
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

      $.each(tabs.find("li a"), function() {
        var a = $(this);
        var id = a.data("tab");
        var tab = $(id);

        a.on("click", function() {
          hidetabs();

          a.parent().addClass("active");

          tab.show();

          if (o && o.show)
            o.show(id);
        });
      });

      $(tabs.find(".active a").data("tab")).show();

    });
  };

}(auto, jQuery));
