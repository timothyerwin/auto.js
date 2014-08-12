(function(){
  var grid = new auto.grid({
    target: $("div#autogrid-simple")
  });

  var state = new auto.grid.state({
    page: 1,
    data: [
      [0, "Tim", "Erwin", "Male", "05/31/1983", "Atlanta", "GA", "USA"],
      [1, "Mark", "Zuckerberg", "Male", "05/14/1984", "Palo Alto", "CA", "USA"],
      [2, "Steve", "Jobs", "Male", "02/24/1955", "Palo Alto", "CA", "USA"],
      [3, "Bill", "Gates", "Male", "10/28/1955", "Redmond", "WA", "USA"],
      [4, "Marissa", "Mayer", "Female", "05/30/1975", "San Francisco", "CA", "USA"]
    ],
    columns: [{
      name: "Id",
      visible: false
    },
    "First Name",
    "Last Name",
    "Sex",
    "Birthdate",
    "City",
    "State",
    "Country"]
  });

  grid.setState(state);

})();
