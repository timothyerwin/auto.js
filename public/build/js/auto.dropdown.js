var auto = auto || {};

(function(auto, $) {

  var hideAll = function() {
    $(".dropdown ul:visible").hide();
  };

  var init = function(){
    $("body").on('click touchstart', function() {
      hideAll();
    });
  };

  $(document).on('ready', function(){
    init();
  });

  var cancelEvent = function(e) {
    var event = window.event || e;

    if (event.stopPropagation)
      event.stopPropagation();
    else
      event.cancelBubble = true;
  };

  $.fn.autodropdown = function(o) {
    return this.each(function() {

      var activator = $(this).children().not("ul").first();
      var menu = $(this).find("ul:first");

      menu.on('touchstart', cancelEvent);

      activator.on('touchstart', cancelEvent);
      activator.on('click', function(e) {

        cancelEvent(e);

        hideAll();

        menu.toggle();
      });
    });
  };

}(auto || {}, jQuery));
