(function(){
  var grid = new auto.grid({
    target: $("div#autogrid-images")
  });

  var state = new auto.grid.state({
    page: 1,
    data: [
      [0, "Facebook", "<img height='40px' src='http://upload.wikimedia.org/wikipedia/commons/3/32/Facebooklogo.png' />"],
      [1, "Google", "<img height='40px' src='http://www.seomofo.com/downloads/new-google-logo-knockoff.png' />"],
      [2, "Yahoo", "<img height='40px' src='http://jeffreybtrull.com/wp-content/uploads/2012/09/yahoo-logo.png' />"],
      [3, "Apple", "<img height='40px' src='http://www.officialpsds.com/images/thumbs/Apple-Logo-psd34240.png' />"],
    ],
    columns: [{
      name: "Id",
      visible: false
    }, {
      name: "Company"
    }, {
      name: "Logo"
    }]
  });

  grid.setState(state);
})();
