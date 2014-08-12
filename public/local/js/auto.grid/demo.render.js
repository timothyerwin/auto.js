(function(){
  var grid = new auto.grid({
    target: $("div#autogrid-render"),
    render: {
      cells: function(state) {
        if (state.column.name == 'Name')
          state.cell.html("<a target='_blank' href='http://google.com/?q=" + state.cellData + "'>" + state.cellData + '</a>');
        else if (state.column.name == 'Country')
          state.cell.html("<img src='/local/images/us.png' /><span style='margin-left:7px;'>" + state.cellData + "</span>");
        else
          return state.cellData;
      }
    }
  });

  var state = new auto.grid.state({
    page: 1,
    data: [
      [0, "Tim Erwin", "Male", "05/31/1983", "Atlanta", "GA", "USA"],
      [1, "Mark Zuckerberg", "Male", "05/14/1984", "Palo Alto", "CA", "USA"],
      [2, "Steve Jobs", "Male", "02/24/1955", "Palo Alto", "CA", "USA"],
      [3, "Bill Gates", "Male", "10/28/1955", "Redmond", "WA", "USA"],
      [4, "Marissa Mayer", "Female", "05/30/1975", "San Francisco", "CA", "USA"]
    ],
    columns: [{
      name: "Id",
      visible: false
    }, {
      name: "Name"
    }, {
      name: "Sex"
    }, {
      name: "Birthdate"
    }, {
      name: "City"
    }, {
      name: "State"
    }, {
      name: "Country"
    }]
  });

  grid.setState(state);
})();
