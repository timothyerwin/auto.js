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
          v.cell.render($.extend(rowState, {
            cell: td
          }));
      });
    }
  };

  var renderCells = function(rowState) {
    $(rowState.rowData.items).each(function(i, v) {
      var column = visibleColumns[i];

      var td = $("<td>");

      rowState.row.append(td);

      if (self.settings.render && self.settings.render.cells) {
        var cellState = $.extend(rowState, {
          cell: td,
          column: column,
          cellData: v
        });

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
