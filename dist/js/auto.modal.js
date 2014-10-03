var auto = auto || {};

(function(auto, $) {

  var create = function(target, o) {

    var modal = $("<div>");

    modal.addClass("automodal");

    modal.html("<div class='box'><div class='wrapper'><div class='header'><span></span><b class='close'>x</b></div><div class='content'></div><div></div>");

    $("body").append(modal);

    var hide = function() {
      modal.hide();

      if (o.close)
        o.close();
    };

    modal.on("click", hide);
    modal.find(".close").on("click", hide);
    modal.find(".box").on("click", function(e) {
      var event = window.event || e;

      if (event.stopPropagation)
        event.stopPropagation();
      else
        event.cancelBubble = true;

      return false;
    });

    modal.find(".content").append(target || '');

    if (o.footer) {
      var footer = $("<div>");
      footer.addClass("footer");
      footer.append(o.footer);

      content.after(footer);
    } else if (modal.find(".footer"))
      modal.find(".content").after(modal.find(".footer"));

    $(target).show();

    return modal;
  };

  $.fn.automodal = function(o) {
    return this.each(function() {
      if (o === 'hide') {
        if (this.modal) {
          this.modal.hide();

          if (this.modal.settings.close)
            this.modal.settings.close();
        }
      } else {
        this.modal = this.modal || create(this, o);
        this.modal.settings = o;
        this.modal.find(".header span").text(o.title || 'D');
        this.modal.show().find(".wrapper").center();
      }
    });
  };

}(auto || {}, jQuery));
