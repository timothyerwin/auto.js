(function(){
  var grid = new auto.grid({
    multiSort: false,
    target: $("div#autogrid-sorting"),
    render: {
      cells: function(state) {
        if (state.column.name == 'Name')
          state.cell.html("<a target='_blank' href='http://google.com/?q=" + state.cellData + "'>" + state.cellData + '</a>');
        else
          return state.cellData;
      }
    },
    actions: [{
      orient: "left",
      header: {
        render: function(state) {
          var a = $("<i class='fa fa-heart' />");

          state.cell.append(a);
        }
      },
      cell: {
        render: function(state) {
          var a = $("<i class='fa fa-heart gray' />");

          state.cell.append(a);

          state.cell.on('click', function() {
            a.toggleClass("hotpink");
          });
        }
      }
    }, {
      orient: "right",
      header: {
        render: function(state) {

        }
      },
      cell: {
        render: function(state) {
          var a = $("<i class='fa fa-times' />");

          state.cell.append(a);

          state.cell.on('click', function() {
            state.row.remove();
          });
        }
      }
    }]
  });

  grid.on("sort", function(r) {
    state.columns.items = r;

    var c = state.columns.getSorted();

    console.log(c);

    if (c) {
      var index = state.columns.getIndex(c[0].name);

      state.data.items.sort(c[0].sortOrder == "asc" ? function(a, b) {
        if (a[index] == b[index]) return 0;
        return a[index] < b[index] ? -1 : 1;
      } : function(a, b) {
        if (a[index] == b[index]) return 0;
        return a[index] < b[index] ? 1 : -1;
      });

      grid.setState(state);
    }
  });

  state = new auto.grid.state({
    page: 1,
    data: [
      [4, "Marissa Mayer", "Female", "05/30/1975", "San Francisco", "CA", "USA"],
      [0, "Tim Erwin", "Male", "05/31/1983", "Atlanta", "GA", "USA"],
      [1, "Mark Zuckerberg", "Male", "05/14/1984", "Palo Alto", "CA", "USA"],
      [2, "Steve Jobs", "Male", "02/24/1955", "Palo Alto", "CA", "USA"],
      [3, "Bill Gates", "Male", "10/28/1955", "Redmond", "WA", "USA"]
    ],
    columns: [{
      name: "Id",
      visible: false
    }, {
      name: "Name",
      sort: true
    }, {
      name: "Sex",
      sort: true,
      sortOrder: "asc"
    }, {
      name: "Birthdate"
    }, {
      name: "City",
      sort: true
    }, {
      name: "State",
      sort: true
    }, {
      name: "Country"
    }]
  });

  grid.setState(state);
})();
