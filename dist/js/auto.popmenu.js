(function ($) {

  $.autopopmenu = null;

  $.fn.autopopmenu = function (settings) {
    $.autopopmenu = this;

    var self = this;

    menu = $(settings.menu);

    if(!menu.hasClass('popmenu')){
      menu.addClass("popmenu");
    }

    if(!menu.hasClass('popover')){
      menu.addClass("popover");
    }

    self.reset = function () {
      for (var i = levels.length; i > 1; i--) {
        levels.pop();
      }

      menu.find('ul').hide();

      active = top;
    };

    self.hide = function () {
      self.reset();

      self.autopopover('hide');

      if (settings.hide) {
        settings.hide();
      }
    };

    var top = menu.find('> ul').eq(0);

    var levels = [top],
      active = top;

    self.back = function () {
      var level = levels.pop();

      menu.find('> ul:visible').hide();

      active = levels[levels.length - 1];
      active.show();
    };

    self.show = function (which) {
      if (which.length > 0) {
        active.hide();

        if (which.find('a.back').length === 0) {
          which.prepend($('<li><a class="back" onclick="$.autopopmenu.back()"><i class="fa fa-chevron-left pull-left"></i>back</a></li>'));
        }

        active = which.show();

        levels.push(active);
      }
    };

    menu.find('a.back').on('click', function (e) {
      self.back();
    });

    menu.find('li a').on('click', function (e) {
      var source = $(this),
        sub = $(source.data('menu'));

      self.show(sub);

      if (e.target.type != 'file') {
        e.preventDefault();
        return false;
      }
    });

    menu.on('click', function (e) {
      if (e.target.type != 'file') {
        e.preventDefault();
        return false;
      }
    });

    return this.each(function () {

      $(this).autopopover({
        popover: settings.menu,
        position: settings.position || 'bottom center',
        trigger: 'manual'
      });

      $(this).on('click', function (e) {
        self.reset();

        top.show();

        $(this).autopopover('show');

        if (settings.show) {
          settings.show({
            source: $(this)
          });
        }

        if (e.target.type != 'file') {
          e.preventDefault();
          return false;
        }
      });
    });
  };

}(jQuery));
