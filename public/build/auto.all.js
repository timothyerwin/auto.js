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

var auto = auto || {};

(function(auto, $) {

  var hideAll = function() {
    $(".dropdown ul:visible").hide();
  };

  $("body").on('click touchstart', function() {
    hideAll();
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

var auto = auto || {};

auto.grid = function(settings) {

  var self = this;

  riot.observable(this);

  if (!settings)
    throw "settings is undefined";

  if (!window.jQuery)
    throw "jquery is not loaded";

  if (!settings.target)
    throw ("settings.target is undefined");

  if (!$(settings.target).is("div"))
    throw "settings.target must be a div element";


  this.stateplayer = new auto.grid.stateplayer();
  this.settings = $.extend(settings || {}, {
    pageSize: 20
  });

  this.settings.target = $(settings.target);
  this.settings.target.addClass("autogrid").hide();

  this.table = $("<table>");

  this.settings.target.append(this.table);

  if (this.settings.actions) {
    for (var i = 0; i < this.settings.actions.length; i++) {
      if (this.settings.actions[i].init)
        this.settings.actions[i].init(this);
    }
  }

  if (this.settings.pager) {
    if (this.settings.pager === "infinite")
      this.pager = new auto.grid.pagers.infinite(self);
    else if (this.settings.pager == "basic")
      this.pager = new auto.grid.pagers.basic(self);
    else if (typeof this.settings.pager == "object")
      this.pager = this.settings.pager;
  }

  if (this.settings.state)
    this.setState(this.settings.state);
};

auto.grid.prototype.normalizeState = function(state) {
  return (state instanceof auto.grid.state) ? state : new auto.grid.state(state);
};

auto.grid.prototype.setState = function(state, settings) {
  state = this.normalizeState(state);

  this.stateplayer.push(state);

  this.trigger("prerender", state);

  this.render(state, settings);

  this.trigger("postrender", state);

  this.settings.target.show();
};

auto.grid.prototype.getState = function() {
  return this.stateplayer.get();
};

auto.grid.prototype.notify = function(state) {
  var restate = $.extend(this.getState(), state || {});

  restate.data.items = null;

  this.trigger("change", restate);
};

auto.grid.prototype.getTarget = function() {
  return this.settings.target;
};

auto.grid.prototype.getRows = function() {
  return this.table.find("tr.arow");
};

auto.grid.prototype.addRow = function(name) {
  var tr = $("<tr>");

  if (name) tr.addClass(name);

  this.table.append(tr);

  return tr;
};

auto.grid.prototype.addRowAtIndex = function(i) {
  var tr = $("<tr>");

  this.table.find("tr.arow").eq(i).before(tr);

  return tr;
};

auto.grid.prototype.addRowAfter = function(row) {
  return this.addRowAtIndex(row.rowIndex);
};

auto.grid.prototype.render = function(state, settings) {
  var self = this;

  if (state.page == 1) {
    this.table.empty();
    this.renderColumns(state);
  }

  if (!state.data.exists())
    return;

  var visibleColumns = state.columns.getVisible();

  var renderActions = function(rowState, filter) {
    if (self.settings.actions) {
      var la = $.grep(self.settings.actions, function(n, i) {
        return filter(n);
      });

      $(la).each(function(i, v) {
        var td = $("<td>");

        if (v.name) td.text(v.name);
        if (v.tooltip) td.prop("title", v.tooltip);

        td.addClass("action");

        rowState.row.append(td);

        if (v.cell && v.cell.render)
          v.cell.render($.extend({
            cell: td
          },rowState));
      });
    }
  };

  var renderCells = function(rowState) {
    $(rowState.rowData.items).each(function(i, v) {
      var column = visibleColumns[i];

      var td = $("<td>");

      rowState.row.append(td);

      if (self.settings.render && self.settings.render.cells) {
        var cellState = $.extend({
          cell: td,
          column: column,
          cellData: v
        },rowState);

        var rr = self.settings.render.cells(cellState);

        if (rr) td.html(rr);
      } else
        td.html(v);
    });
  };

  $(state.data.getVisible()).each(function(i, v) {
    var tr = self.addRow("arow");

    var rowState = {
      row: tr,
      rowIndex: i,
      rowData: {
        items: v,
        object: state.data.toObject(i)
      }
    };

    renderActions(rowState, function(v) {
      return (v.orient == "left" || !v.orient);
    });
    renderCells(rowState, v);
    renderActions(rowState, function(v) {
      return (v.orient == "right");
    });

  });
};

auto.grid.prototype.renderColumns = function(state) {
  var self = this;
  var vc = state.columns.getVisible();

  if (!state.columns.exists() || !vc)
    return false;

  var tr = this.addRow("header");

  var actionFilter = function(filter) {
    if (self.settings.actions) {
      var la = $.grep(self.settings.actions, function(n, i) {
        return filter(n);
      });

      $(la).each(function(i, v) {
        var td = $("<td>");

        if (v.name) td.text(v.name);

        tr.append(td);

        td.addClass("action");

        if (v.header && v.header.render)
          v.header.render({
            row: tr,
            cell: td
          });
      });
    }
  };

  actionFilter(function(v) {
    return (v.orient == "left" || !v.orient);
  });

  $(vc).each(function(i, v) {
    var td = $("<td>");
    td.text(v.description || v.name);

    td.on("selectstart", function() {
      return false;
    });

    if (v.sort) {
      td.addClass("autosort");

      var sorter = $("<i class='fa'>");
      sorter.data("name", v.name || v.description);

      td.append(sorter);

      if (v.sortOrder)
        sorter.toggleClass("on fa-chevron-" + (v.sortOrder == 'asc' ? "up" : "down"));
      else
        sorter.toggleClass("fa-chevron-down");

      td.on("click", function(ev) {
        if (!sorter.hasClass("on"))
          sorter.addClass("on");
        else {
          sorter.toggleClass("fa-chevron-down");
          sorter.toggleClass("fa-chevron-up");
        }

        if (!self.settings.multiSort || !ev.shiftKey) {
          tr.find('td i').each(function() {
            $(this).removeClass("on");
          });
        }

        sorter.removeClass("on").addClass("on");

        $(state.columns.getSorted()).each(function(i, v) {
          delete v.sortOrder;
        });

        tr.find('td i.on').each(function(i, v) {
          var s = $(v);

          var c = state.columns.getByName(s.data("name"));

          c.sortOrder = s.hasClass("fa-chevron-up") ? "asc" : "desc";
        });

        self.trigger("sort", state.columns.items);
      });
    }

    tr.append(td);
  });

  actionFilter(function(v) {
    return (v.orient == "right");
  });
};

auto.grid.state = function(state) {
  var self = this;

  self.page = 1;

  self.data = {
    items: [],
    length: function() {
      return self.data.items.length;
    },
    exists: function() {
      return self.data.items.length > 0;
    },
    get: function(filter) {
      if (self.columns.getHidden().length === 0)
        return self.data.items;

      filter = filter || function() {
        return true;
      };

      var results = [];

      for (var d = 0; d < self.data.items.length; d++) {
        var copy = self.data.items[d].slice();

        for (var i = self.columns.items.length - 1; i >= 0; i--) {
          if (!filter(self.columns.items[i], copy[i], i))
            copy.splice(i, 1);
        }

        results.push(copy);
      }

      return results;
    },
    getVisible: function() {
      return self.data.get(function(c, d, i) {
        return c.visible === undefined || c.visible === true;
      });
    },
    getHidden: function() {
      return self.data.get(function(c, d, i) {
        return c.visible === false;
      });
    },
    toObject: function(index) {
      if (!self.data.exists())
        return null;

      var o = {};

      for (var x = 0; x < self.columns.items.length; x++) {
        var column = self.columns.items[x];

        o[column.name] = self.data.items[index][x];
      }

      return o;
    },
    toObjects: function() {
      var results = [];

      if (!self.data.exists())
        return null;

      var di = self.data.items;

      for (var i = 0; i < di.length; i++)
        results.push(self.data.toObject(i));

      return results;
    }
  };

  self.columns = {
    items: [],
    length: function() {
      return self.columns.items.length;
    },
    exists: function() {
      return self.columns.items.length > 0;
    },
    getVisible: function() {
      if (!self.columns.exists())
        return [];

      return $.grep(self.columns.items, function(n, i) {
        return n.visible === undefined || n.visible === true;
      });
    },
    getHidden: function() {
      if (!self.columns.exists())
        return [];

      return $.grep(self.columns.items, function(n, i) {
        return n.visible === false;
      });
    },
    getIndex: function(name) {
      var ci = self.columns.items;
      for (var i = 0; i < ci.length; i++) {
        if (ci[i].name == name)
          return i;
      }

      return -1;
    },
    getByName: function(name) {
      var ci = self.columns.items;
      for (var i = 0; i < ci.length; i++) {
        if (ci[i].name == name)
          return ci[i];
      }

      return null;
    },
    getSorted: function() {
      return $.grep(self.columns.items, function(n, i) {
        return n.sortOrder;
      });
    }
  };

  self.sort = {
    items: [],
    length: function() {
      return self.sort.items.length;
    },
    exists: function() {
      return self.sort.items.length > 0;
    }
  };

  if (state && state.columns) {
    var cols = [];

    for (var i = 0; i < state.columns.length; i++) {
      var col = state.columns[i];

      cols.push((typeof col === "string") ? {
        name: col
      } : col);
    }

    state.columns = cols;
  }

  if (state) {
    self.sort.items = state.sort;
    self.data.items = state.data;
    self.columns.items = state.columns;
    self.page = state.page || self.page;
    self.total = state.total;
  }

  return self;
};

auto.grid.stateplayer = function() {
  this.states = [];

  this.push = function(state) {
    this.states.push(state);
  };

  this.pop = function() {
    return this.states.pop();
  };

  this.unshift = function() {
    return this.states.unshift();
  };

  this.shift = function(state) {
    return this.states.shift(state);
  };

  this.merge = function() {};

  this.get = function() {
    return this.states[this.states.length - 1];
  };

  this.clear = function() {
    this.states = [];
  };
};

auto.grid.pagers = auto.grid.pagers || {};

auto.grid.pagers.basic = function(grid, settings) {
  this.settings = $.extend({}, settings);

  var self = this;

  riot.observable(this);

  var box = $("<div class='pager'>");
  var pager = $("<ul class='pager-basic'>");

  box.append(pager);

  grid.settings.target.after(box);

  grid.on("prerender", function(state) {
    grid.table.empty();
    grid.renderColumns(state);

    pager.empty();

    var page = state.page;
    var pages = Math.ceil(state.total / grid.settings.pageSize);

    var prev = $("<li class='link prev' title='Previous'><span class='fa fa-chevron-left'/></li>");
    var next = $("<li class='link next' title='Next'><span class='fa fa-chevron-right'/></li>");

    if (page == pages)
      next.addClass("disabled");
    else {
      next.on("click", function() {
        grid.notify({
          page: page + 1
        });
      });
    }

    if (page == 1)
      prev.addClass("disabled");
    else {
      prev.on("click", function() {
        grid.notify({
          page: page - 1
        });
      });
    }

    pager.append(prev);

    pager.append("<li class='page'>" + page + " / " + pages + "</li>");

    pager.append(next);

    box.fadeIn();
  });
};

auto.grid.pagers.infinite = function(grid, settings) {
  settings = $.extend({}, settings);

  var self = this,
    win = $(window),
    doc = $(document),
    offset = settings.offset || 300,
    enabled = false;

  riot.observable(this);

  this.settings = settings;

  win.scroll(function() {
    if (!enabled)
      return;

    if (win.scrollTop() > (doc.height() - win.height() - offset)) {
      enabled = false;

      var state = grid.getState();

      grid.notify({
        page: state.page + 1
      });
    }
  });

  grid.on("prerender", function(state) {
    enabled = true;
  });

  grid.on("postrender", function(state) {
    win.trigger("scroll");
  });
};

auto.grid.actions = auto.grid.actions || {};

auto.grid.actions.count = function(settings) {
  var self = this;

  riot.observable(this);

  this.init = function(grid) {
    this.grid = grid;
  };

  this.cell = {
    render: function(state) {
      state.cell.css("text-align", "right");
      state.cell.css('color', '#ccc');
      state.cell.html(state.row.index());
    }
  };
};

auto.grid.actions.select = function(settings) {
  var self = this;

  riot.observable(this);

  this.orient = settings.orient || "left";
  this.tooltip = settings.tooltip || "";

  this.init = function(grid) {
    this.grid = grid;
  };

  this.header = {
    render: function(state) {
      var a = $("<input type='checkbox' />");

      state.cell.append(a);

      self.on("one", function() {
        a.prop("checked", self.grid.getRows().length === self.getSelectedRows().length);
      });

      a.on("click", function() {
        var checked = a.is(":checked");
        self.trigger("inner-all", checked).trigger("all", checked);
      });
    }
  };

  this.cell = {
    render: function(state) {
      var a = $("<input type='checkbox' />");

      state.cell.append(a);

      var execute = function() {
        if (settings.highlight) {
          state.row.removeClass("highlight");

          if (a.is(":checked"))
            state.row.addClass("highlight");
        }
      };

      self.on("inner-all", function(clicked) {
        a.prop('checked', clicked);
        execute();
      });

      a.on('click', function() {
        execute();

        self.trigger("one", a.is('checked'));
      });
    }
  };

  this.getSelectedRows = function() {
    return this.grid.table.find("tr.arow input[type='checkbox']:checked");
  };

  return this;
};

auto.grid.actions.expand = function(settings) {
  var self = this;

  riot.observable(this);

  this.orient = settings.orient || "left";
  this.tooltip = settings.tooltip || "";
  this.hide = settings.hide || false;
  this.expandClass = settings.expandClass || "fa fa-chevron-right blue";
  this.collapseClass = settings.collapseClass || "fa-chevron-down";

  this.init = function(grid) {
    this.grid = grid;
  };

  this.cell = {
    render: function(state) {
      state.row.on("destroyed", function() {
        if (state.container)
          state.container.parent().remove();
      });

      var a = $("<i>");

      a.addClass(self.expandClass);

      state.cell.append(a);

      state.cell.on('click', function() {
        a.toggleClass(self.collapseClass);

        var expanded = a.hasClass(self.collapseClass);

        if (expanded) {
          var container;

          if (self.hide && state.container) {
            container = state.container;
            container.closest("tr").show();
          } else {
            container = $("<td colspan='99' />");
            a.closest("tr").after($("<tr class-'expand'>").append(container));
          }

          state.container = container;

          self.trigger("expand", state);
        } else {
          var target = a.closest("tr").next();

          if (self.hide)
            target.hide();
          else {
            state.container = null;
            target.remove();
          }

          self.trigger("collapse", state);
        }
      });
    }
  };
};

var auto = auto || {};

(function(auto, $) {

  var create = function(target, o) {

    var modal = $("<div>");

    modal.addClass("automodal");

    modal.html("<div class='box'><div class='wrapper'><div class='header no-select'><span></span><b class='close'>x</b></div><div class='content'></div><div></div>");

    $("body").append(modal);

    var hide = function() {
      modal.hide();

      if (o.close)
        o.close();
    };

    var wrapper = modal.find('.wrapper'),
      move = {
        initialX: 0,
        initialY: 0,
        enabled: false
      };

    if (o.canMove) {
      var header = modal.find('.header');

      header.addClass('move').on('mousedown', function(e) {
        move.enabled = true;

        var ev = e.originalEvent;

        move.initialX = ev.offsetX || ev.layerX;
        move.initialY = ev.offsetY || ev.layerY;
      });

      $('body').on('mousemove', function(e) {
        if (move.enabled) {
          var ev = e.originalEvent;

          wrapper
            .css('top', ev.pageY - move.initialY)
            .css('left', ev.pageX - move.initialX);
        }
      }).on('mouseup', function() {
        move.enabled = false;
      });
    }

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
        var wrapper = this.modal.show().find(".wrapper");

        wrapper
          .css('top', 'calc(50% - ' + wrapper.height() + 'px /2)')
          .css('left', 'calc(50% - ' + wrapper.width() + 'px /2)');
      }
    });
  };

}(auto || {}, jQuery));

/*!
 * jQuery UI Position @VERSION
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */
(function(factory) {
  if (typeof define === "function" && define.amd) {

    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else {

    // Browser globals
    factory(jQuery);
  }
}(function($) {
  (function() {

    $.ui = $.ui || {};

    var cachedScrollbarWidth, supportsOffsetFractions,
      max = Math.max,
      abs = Math.abs,
      round = Math.round,
      rhorizontal = /left|center|right/,
      rvertical = /top|center|bottom/,
      roffset = /[\+\-]\d+(\.[\d]+)?%?/,
      rposition = /^\w+/,
      rpercent = /%$/,
      _position = $.fn.position;

    function getOffsets(offsets, width, height) {
      return [
        parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1),
        parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)
      ];
    }

    function parseCss(element, property) {
      return parseInt($.css(element, property), 10) || 0;
    }

    function getDimensions(elem) {
      var raw = elem[0];
      if (raw.nodeType === 9) {
        return {
          width: elem.width(),
          height: elem.height(),
          offset: {
            top: 0,
            left: 0
          }
        };
      }
      if ($.isWindow(raw)) {
        return {
          width: elem.width(),
          height: elem.height(),
          offset: {
            top: elem.scrollTop(),
            left: elem.scrollLeft()
          }
        };
      }
      if (raw.preventDefault) {
        return {
          width: 0,
          height: 0,
          offset: {
            top: raw.pageY,
            left: raw.pageX
          }
        };
      }
      return {
        width: elem.outerWidth(),
        height: elem.outerHeight(),
        offset: elem.offset()
      };
    }

    $.position = {
      scrollbarWidth: function() {
        if (cachedScrollbarWidth !== undefined) {
          return cachedScrollbarWidth;
        }
        var w1, w2,
          div = $("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
          innerDiv = div.children()[0];

        $("body").append(div);
        w1 = innerDiv.offsetWidth;
        div.css("overflow", "scroll");

        w2 = innerDiv.offsetWidth;

        if (w1 === w2) {
          w2 = div[0].clientWidth;
        }

        div.remove();

        return (cachedScrollbarWidth = w1 - w2);
      },
      getScrollInfo: function(within) {
        var overflowX = within.isWindow || within.isDocument ? "" :
          within.element.css("overflow-x"),
          overflowY = within.isWindow || within.isDocument ? "" :
          within.element.css("overflow-y"),
          hasOverflowX = overflowX === "scroll" ||
          (overflowX === "auto" && within.width < within.element[0].scrollWidth),
          hasOverflowY = overflowY === "scroll" ||
          (overflowY === "auto" && within.height < within.element[0].scrollHeight);
        return {
          width: hasOverflowY ? $.position.scrollbarWidth() : 0,
          height: hasOverflowX ? $.position.scrollbarWidth() : 0
        };
      },
      getWithinInfo: function(element) {
        var withinElement = $(element || window),
          isWindow = $.isWindow(withinElement[0]),
          isDocument = !!withinElement[0] && withinElement[0].nodeType === 9;
        return {
          element: withinElement,
          isWindow: isWindow,
          isDocument: isDocument,
          offset: withinElement.offset() || {
            left: 0,
            top: 0
          },
          scrollLeft: withinElement.scrollLeft(),
          scrollTop: withinElement.scrollTop(),
          width: isWindow ? withinElement.width() : withinElement.outerWidth(),
          height: isWindow ? withinElement.height() : withinElement.outerHeight()
        };
      }
    };

    $.fn.position = function(options) {
      if (!options || !options.of) {
        return _position.apply(this, arguments);
      }

      // make a copy, we don't want to modify arguments
      options = $.extend({}, options);

      var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
        target = $(options.of),
        within = $.position.getWithinInfo(options.within),
        scrollInfo = $.position.getScrollInfo(within),
        collision = (options.collision || "flip").split(" "),
        offsets = {};

      dimensions = getDimensions(target);
      if (target[0].preventDefault) {
        // force left top to allow flipping
        options.at = "left top";
      }
      targetWidth = dimensions.width;
      targetHeight = dimensions.height;
      targetOffset = dimensions.offset;
      // clone to reuse original targetOffset later
      basePosition = $.extend({}, targetOffset);

      // force my and at to have valid horizontal and vertical positions
      // if a value is missing or invalid, it will be converted to center
      $.each(["my", "at"], function() {
        var pos = (options[this] || "").split(" "),
          horizontalOffset,
          verticalOffset;

        if (pos.length === 1) {
          pos = rhorizontal.test(pos[0]) ?
            pos.concat(["center"]) :
            rvertical.test(pos[0]) ? ["center"].concat(pos) : ["center", "center"];
        }
        pos[0] = rhorizontal.test(pos[0]) ? pos[0] : "center";
        pos[1] = rvertical.test(pos[1]) ? pos[1] : "center";

        // calculate offsets
        horizontalOffset = roffset.exec(pos[0]);
        verticalOffset = roffset.exec(pos[1]);
        offsets[this] = [
          horizontalOffset ? horizontalOffset[0] : 0,
          verticalOffset ? verticalOffset[0] : 0
        ];

        // reduce to just the positions without the offsets
        options[this] = [
          rposition.exec(pos[0])[0],
          rposition.exec(pos[1])[0]
        ];
      });

      // normalize collision option
      if (collision.length === 1) {
        collision[1] = collision[0];
      }

      if (options.at[0] === "right") {
        basePosition.left += targetWidth;
      } else if (options.at[0] === "center") {
        basePosition.left += targetWidth / 2;
      }

      if (options.at[1] === "bottom") {
        basePosition.top += targetHeight;
      } else if (options.at[1] === "center") {
        basePosition.top += targetHeight / 2;
      }

      atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
      basePosition.left += atOffset[0];
      basePosition.top += atOffset[1];

      return this.each(function() {
        var collisionPosition, using,
          elem = $(this),
          elemWidth = elem.outerWidth(),
          elemHeight = elem.outerHeight(),
          marginLeft = parseCss(this, "marginLeft"),
          marginTop = parseCss(this, "marginTop"),
          collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") + scrollInfo.width,
          collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") + scrollInfo.height,
          position = $.extend({}, basePosition),
          myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());

        if (options.my[0] === "right") {
          position.left -= elemWidth;
        } else if (options.my[0] === "center") {
          position.left -= elemWidth / 2;
        }

        if (options.my[1] === "bottom") {
          position.top -= elemHeight;
        } else if (options.my[1] === "center") {
          position.top -= elemHeight / 2;
        }

        position.left += myOffset[0];
        position.top += myOffset[1];

        // if the browser doesn't support fractions, then round for consistent results
        if (!supportsOffsetFractions) {
          position.left = round(position.left);
          position.top = round(position.top);
        }

        collisionPosition = {
          marginLeft: marginLeft,
          marginTop: marginTop
        };

        $.each(["left", "top"], function(i, dir) {
          if ($.ui.position[collision[i]]) {
            $.ui.position[collision[i]][dir](position, {
              targetWidth: targetWidth,
              targetHeight: targetHeight,
              elemWidth: elemWidth,
              elemHeight: elemHeight,
              collisionPosition: collisionPosition,
              collisionWidth: collisionWidth,
              collisionHeight: collisionHeight,
              offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
              my: options.my,
              at: options.at,
              within: within,
              elem: elem
            });
          }
        });

        if (options.using) {
          // adds feedback as second argument to using callback, if present
          using = function(props) {
            var left = targetOffset.left - position.left,
              right = left + targetWidth - elemWidth,
              top = targetOffset.top - position.top,
              bottom = top + targetHeight - elemHeight,
              feedback = {
                target: {
                  element: target,
                  left: targetOffset.left,
                  top: targetOffset.top,
                  width: targetWidth,
                  height: targetHeight
                },
                element: {
                  element: elem,
                  left: position.left,
                  top: position.top,
                  width: elemWidth,
                  height: elemHeight
                },
                horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
              };
            if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
              feedback.horizontal = "center";
            }
            if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
              feedback.vertical = "middle";
            }
            if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
              feedback.important = "horizontal";
            } else {
              feedback.important = "vertical";
            }
            options.using.call(this, props, feedback);
          };
        }

        elem.offset($.extend(position, {
          using: using
        }));
      });
    };

    $.ui.position = {
      fit: {
        left: function(position, data) {
          var within = data.within,
            withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
            outerWidth = within.width,
            collisionPosLeft = position.left - data.collisionPosition.marginLeft,
            overLeft = withinOffset - collisionPosLeft,
            overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
            newOverRight;

          // element is wider than within
          if (data.collisionWidth > outerWidth) {
            // element is initially over the left side of within
            if (overLeft > 0 && overRight <= 0) {
              newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
              position.left += overLeft - newOverRight;
              // element is initially over right side of within
            } else if (overRight > 0 && overLeft <= 0) {
              position.left = withinOffset;
              // element is initially over both left and right sides of within
            } else {
              if (overLeft > overRight) {
                position.left = withinOffset + outerWidth - data.collisionWidth;
              } else {
                position.left = withinOffset;
              }
            }
            // too far left -> align with left edge
          } else if (overLeft > 0) {
            position.left += overLeft;
            // too far right -> align with right edge
          } else if (overRight > 0) {
            position.left -= overRight;
            // adjust based on position and margin
          } else {
            position.left = max(position.left - collisionPosLeft, position.left);
          }
        },
        top: function(position, data) {
          var within = data.within,
            withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
            outerHeight = data.within.height,
            collisionPosTop = position.top - data.collisionPosition.marginTop,
            overTop = withinOffset - collisionPosTop,
            overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
            newOverBottom;

          // element is taller than within
          if (data.collisionHeight > outerHeight) {
            // element is initially over the top of within
            if (overTop > 0 && overBottom <= 0) {
              newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
              position.top += overTop - newOverBottom;
              // element is initially over bottom of within
            } else if (overBottom > 0 && overTop <= 0) {
              position.top = withinOffset;
              // element is initially over both top and bottom of within
            } else {
              if (overTop > overBottom) {
                position.top = withinOffset + outerHeight - data.collisionHeight;
              } else {
                position.top = withinOffset;
              }
            }
            // too far up -> align with top
          } else if (overTop > 0) {
            position.top += overTop;
            // too far down -> align with bottom edge
          } else if (overBottom > 0) {
            position.top -= overBottom;
            // adjust based on position and margin
          } else {
            position.top = max(position.top - collisionPosTop, position.top);
          }
        }
      },
      flip: {
        left: function(position, data) {
          var within = data.within,
            withinOffset = within.offset.left + within.scrollLeft,
            outerWidth = within.width,
            offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
            collisionPosLeft = position.left - data.collisionPosition.marginLeft,
            overLeft = collisionPosLeft - offsetLeft,
            overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
            myOffset = data.my[0] === "left" ?
            -data.elemWidth :
            data.my[0] === "right" ?
            data.elemWidth :
            0,
            atOffset = data.at[0] === "left" ?
            data.targetWidth :
            data.at[0] === "right" ?
            -data.targetWidth :
            0,
            offset = -2 * data.offset[0],
            newOverRight,
            newOverLeft;

          if (overLeft < 0) {
            newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
            if (newOverRight < 0 || newOverRight < abs(overLeft)) {
              position.left += myOffset + atOffset + offset;
            }
          } else if (overRight > 0) {
            newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
            if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
              position.left += myOffset + atOffset + offset;
            }
          }
        },
        top: function(position, data) {
          var within = data.within,
            withinOffset = within.offset.top + within.scrollTop,
            outerHeight = within.height,
            offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
            collisionPosTop = position.top - data.collisionPosition.marginTop,
            overTop = collisionPosTop - offsetTop,
            overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
            top = data.my[1] === "top",
            myOffset = top ?
            -data.elemHeight :
            data.my[1] === "bottom" ?
            data.elemHeight :
            0,
            atOffset = data.at[1] === "top" ?
            data.targetHeight :
            data.at[1] === "bottom" ?
            -data.targetHeight :
            0,
            offset = -2 * data.offset[1],
            newOverTop,
            newOverBottom;
          if (overTop < 0) {
            newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
            if ((position.top + myOffset + atOffset + offset) > overTop && (newOverBottom < 0 || newOverBottom < abs(overTop))) {
              position.top += myOffset + atOffset + offset;
            }
          } else if (overBottom > 0) {
            newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
            if ((position.top + myOffset + atOffset + offset) > overBottom && (newOverTop > 0 || abs(newOverTop) < overBottom)) {
              position.top += myOffset + atOffset + offset;
            }
          }
        }
      },
      flipfit: {
        left: function() {
          $.ui.position.flip.left.apply(this, arguments);
          $.ui.position.fit.left.apply(this, arguments);
        },
        top: function() {
          $.ui.position.flip.top.apply(this, arguments);
          $.ui.position.fit.top.apply(this, arguments);
        }
      }
    };

    // fraction support test
    (function() {
      var testElement, testElementParent, testElementStyle, offsetLeft, i,
        body = document.getElementsByTagName("body")[0],
        div = document.createElement("div");

      //Create a "fake body" for testing based on method used in jQuery.support
      testElement = document.createElement(body ? "div" : "body");
      testElementStyle = {
        visibility: "hidden",
        width: 0,
        height: 0,
        border: 0,
        margin: 0,
        background: "none"
      };
      if (body) {
        $.extend(testElementStyle, {
          position: "absolute",
          left: "-1000px",
          top: "-1000px"
        });
      }
      for (i in testElementStyle) {
        testElement.style[i] = testElementStyle[i];
      }
      testElement.appendChild(div);
      testElementParent = body || document.documentElement;
      testElementParent.insertBefore(testElement, testElementParent.firstChild);

      div.style.cssText = "position: absolute; left: 10.7432222px;";

      offsetLeft = $(div).offset().left;
      supportsOffsetFractions = offsetLeft > 10 && offsetLeft < 11;

      testElement.innerHTML = "";
      testElementParent.removeChild(testElement);
    })();

  })();

  return $.ui.position;

}));

var auto = auto || {};

(function(auto, $) {

  var hideAll = function() {
    $(".popover:visible").hide();
  };

  $("body").on('click touchstart', function(e) {
    if (!e.target.popover)
      hideAll();
  });

  var cancelEvent = function(e) {
    var event = window.event || e;

    if (event.stopPropagation)
      event.stopPropagation();
    else
      event.cancelBubble = true;
  };

  $.fn.autopopover = function(o) {
    return this.each(function() {

      if(typeof(o) != 'string' && this.popover){
        return;
      }

      var activator = $(this);
      var popover = $(this.popover || o.popover);

      this.popover = this.popover || popover;

      if (typeof(o) != 'string') {
        o = $.extend({
          trigger: 'click',
          position: 'bottom center'
        }, o);

        this.popover.settings = o;
      }

      var settings = this.popover.settings;

      var position = function() {
        var s = settings;

        s.position = s.position || "bottom center";

        var positions = s.position.split(" ");

        if (positions.length == 1)
          positions.push("center");

        var ppos = positions[0];
        var apos = positions[1];

        var positionLookup = {
          "bottom": {
            my: apos + " top",
            at: apos + " bottom+15px",
            arrow: "top"
          },
          "top": {
            my: apos + " bottom",
            at: apos + " top-15px",
            arrow: "bottom"
          },
          "left": {
            my: "right " + apos,
            at: "left-15px " + apos + function() {
              if (apos == "top") return "-15px";
              else if (apos == "bottom") return "+15px";
              return "+0px";
            }(),
            arrow: "right"
          },
          "right": {
            my: "left " + apos,
            at: "right+15px " + apos + function() {
              if (apos == "top") return "-15px";
              else if (apos == "bottom") return "+15px";
              return "+0px";
            }(),
            arrow: "left"
          }
        };

        var pos = positionLookup[ppos];

        if (!popover.hasClass('arrow-' + pos.arrow)) {
          popover.addClass("arrow-" + pos.arrow);
        }

        if (!popover.hasClass(apos)) {
          popover.addClass(apos);
        }

        var state = {
          my: pos.my,
          at: pos.at,
          of: activator,
          collision: "none"
        };

        popover.css("top", '').css('left', '').position(state);
      };

      if (typeof(o) === 'string') {
        position();

        if (o === 'show') {
          popover.show();
        } else if (o === 'hide') {
          popover.hide();
        } else if (o === 'toggle') {
          popover.toggle();
        }

        return;
      }

      popover.on('click touchstart', cancelEvent);

      activator.on('touchstart', cancelEvent);

      activator.on(o.trigger, function(e) {
        cancelEvent(e);

        var active = $(".popover:visible");

        if(active.length === 1 && popover[0] != active[0])
          hideAll();

        position();

        popover.toggle();
      });

    });
  };

}(auto || {}, jQuery));

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

          tab.css('display','none');

          if (o && o.hide)
            o.hide(id);
        });
      };

      var showtab = function(a) {
        var id = a.data("tab");
        var tab = $(id);

        hidetabs();

        a.parent().addClass("active");

        tab.css('display','block');

        if (o && o.show)
          o.show(id);
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
