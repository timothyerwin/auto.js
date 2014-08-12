(function(){
  var grid = new auto.grid({
    target: $("div#autogrid-expand"),
    actions: [new auto.grid.actions.expand({
      expandClass: "fa fa-play blue",
      collapseClass: "fa-stop",
      tooltip: "Watch this song on YouTube" //, hide: true
    }).on("expand", function(s) {
      if (s.container.is(":empty"))
        s.container.html('<iframe width="500" height="315" src="//www.youtube.com/embed/' + s.rowData.object.Url + '?autoplay=1' + (s.rowData.object.UrlQuery || '') + '" frameborder="0" allowfullscreen></iframe>');
    }), {
      orient: "right",
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

  state = new auto.grid.state({
    page: 1,
    data: [
      ["Jay-Z", "Young Forever", "The Blueprint 3", "2010", "E1nbvplgElw", "&start=65"],
      ["Beyonce", "Sweet Dreams", "I Am...Sasha Fierce", "2008", "JlxByc0-V40", null],
      ["R.E.M", "Nightswimming", "Automatic for the People", "1992", "ahJ6Kh8klM4", null],
      ["Offer Nissim", "Only You", "First Time (feat. Maya)", "2005", "qU7tieVmpjc", null],
      ["Guns N' Roses", "Sweet Child O' Mine", "Appetite for Destruction", "1987", "1w7OgIMMRc4", null]
    ],
    columns: [{
      name: "Artist"
    }, {
      name: "Song"
    }, {
      name: "Album"
    }, {
      name: "Year"
    }, {
      name: "Url",
      visible: false
    },{
      name: "UrlQuery",
      visible: false
    }]
  });

  grid.setState(state);
})();
