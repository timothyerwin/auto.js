$.ajaxSetup({ cache: true });

var site = (new function () {
  var self = riot.observable(this);

  self.init = function () {

    $('#toggle-nav').on('click', function(){
      var menu = $('#content > aside ul');

      menu.toggle();
    });

    return self;
  };

  $(self.init);
}());

site.router = (new function () {
  var self = riot.observable(this);

  self.route = function (route, callback) {
    page(route, callback);

    self.trigger('route', route);
  };

  self.load = function (route) {
    page(route);

    self.trigger('route', route);
  };

  self.listen = function () {
    page({
      click: false
    });
  };
}());

site.routes = (new function () {
  var self = riot.observable(this);

  var navlinks = null;

  var routes = [{
    route: '/',
    execute: 'home.html',
    nav: 'home'
  },{
    route: '/home',
    execute: 'home.html',
    nav: 'home'
  },{
    route: '/grid',
    execute: 'grid.html',
    nav: 'grid'
  }, {
    route: '/modal',
    execute: 'modal.html',
    nav: 'modal'
  }, {
    route: '/tabs',
    execute: 'tabs.html',
    nav: 'tabs',
    refresh: true
  }, {
    route: '/dropdown',
    execute: 'dropdown.html',
    nav: 'dropdown'
  }, {
    route: '/popover',
    execute: 'popover.html',
    nav: 'popover'
  }, {
    route: '/popmenu',
    execute: 'popmenu.html',
    nav: 'popmenu'
  }, {
    route: '/download',
    execute: 'download.html',
    nav: 'download'
  }, {
    route: '/license',
    execute: 'license.html',
    nav: 'license'
  }, {
    route: '/faq',
    execute: 'faq.html',
    nav: 'faq'
  }, {
    route: '404',
    execute: '404.html'
  }];

  var hideOnLoad = false;

  var load = function(route) {

    var link = route.execute || route;

    self.trigger('load', route);

    if (route.nav) {
      navlinks.removeClass('active');

      $('nav li a[data-nav="' + route.nav + '"]').addClass('active');
    }

    var p = $('.page[data-link="' + link + '"]');

    if (route.refresh) {
      p.remove();
      p = null;
    }

    $('.page').hide();

    if (p && p.length > 0) {
      p.show();
    } else {
      p = $('<section class="page" data-link="' + link + '" />');

      $('#pages').append(p);

      p.load('/html/' + link).fadeIn();
    }

    if (hideOnLoad) {
      nav.hide();
    }

    window.setTimeout(function() {
      p.find('input[type=\'text\']:first').focus();
    }, 100);
  };

  $.each(routes, function(i, v) {
    site.router.route(v.route, function(route) {
      route = $.extend(v, route);

      if (site.router.current && route.path === site.router.current.path) {

        if (hideOnLoad) {
          nav.hide();
        }

        return;
      }

      site.router.current = route;

      if (typeof(route.execute) === 'string') {
        load(route);
      } else if (typeof(route.execute) === 'function') {
        route.execute(route);
      }
    });
  });

  site.router.route('*', function() {
    load('404.html');
  });

  self.start = function(){
    site.router.listen();
  };

  self.init = function(){
     navlinks = $('#content aside ul li a');
    //
    // navlinks.on('click', function(e) {
    //   e.preventDefault();
    //
    //   site.router.load($(this).attr('href'));
    // });

  };

  $(self.init);
}());

site.disqus = (new function () {
  var self = riot.observable(this);

  self.init = function () {

    site.routes.on('load', function(e){

      var route = e.route || e, d = $('#disqus');

      if(route.indexOf('404.html') === 0){
        d.hide();
      } else{
        d.show();

        self.load();
      }
    });
  };

  self.load = function () {
    if(window.DISQUS){
        DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = document.location.pathname;
            this.page.url = document.location.toString();
          }
        });
    } else{
      window.disqus_shortname = 'autojs';
      window.disqus_identifier = document.location.pathname;
      window.disqus_url = document.location.toString();

      (function () {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = 'http://angularjs.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] ||
          document.getElementsByTagName('body')[0]).appendChild(dsq);
      })();
    }
  };

  $(self.init);
}());

$(site.routes.start);
