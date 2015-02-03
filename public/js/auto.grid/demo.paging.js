(function(){
  function queryToJSON() {
    var pairs = location.search.slice(1).split('&');

    var result = {};
    pairs.forEach(function(pair) {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
  }

  var query = queryToJSON();

  var grid = null;

  var pageboot = function(which){

    $("div#autogrid-paging").empty();
    $(".pager").remove();

    grid = new auto.grid({
      target: $("div#autogrid-paging"),
      pager: which || "basic",
      render: {
        cells: function(state) {
          if (state.column.name == 'Price') {
            var price = state.cellData;

            if (price == -1)
              price = "AlbumOnly";
            else
              price = "$" + price;

            state.cell.html(price);
          } else if (state.column.name == 'Release')
            return moment(state.cellData).format("L");
          else
            return state.cellData;
        }
      },
      actions: [
        new auto.grid.actions.count(), {
          header: {
            render: function(state) {
              var a = $("<i class='fa fa-play gray' />");

              state.cell.append(a);

              state.cell.css("width", "10px");
            }
          },
          cell: {
            render: function(state) {
              var a = $("<i class='fa fa-play blue' />");

              state.cell.append(a);

              grid.on("play", function() {
                if (state.clip) {
                  a.removeClass("fa-pause");

                  state.clip.pause();
                }
              });

              state.cell.on('click', function() {
                state.clip = state.clip || new Audio(state.rowData.object.Preview);

                if (!a.hasClass("fa-pause"))
                  grid.trigger("play");

                a.toggleClass("fa-pause");

                if (a.hasClass("fa-pause"))
                  state.clip.play();
                else
                  state.clip.pause();
              });
            }
          }
        }
      ]
    });

    grid.on("change", function(state) {
      lookup(state.page, grid.settings.pageSize);
    });

    lookup(1, grid.settings.pageSize);
  };

  var itunes = {
    cache: {
      lookup: null
    },
    api: {
      lookup: function(callback) {
        if (itunes.cache.lookup)
          return callback(itunes.cache.lookup);

        $.getJSON('https://itunes.apple.com/lookup?id=722383&entity=song&limit=200&sort=recent&callback=?').done(function(res) {
          itunes.cache.lookup = res;
          callback(res);
        });
      }
    }
  };

  var lookup = function(page, limit) {
    itunes.api.lookup(function(res) {

      var tracks = $.grep(res.results, function(o) {
        return o.wrapperType == "track";
      });

      var state = {
        page: page,
        total: tracks.length,
        columns: [{
          name: "Artist"
        }, {
          name: "Track"
        }, {
          name: "Release"
        }, {
          name: "Price"
        }, {
          name: "Preview",
          visible: false
        }],
        data: []
      };

      var offset = (page - 1) * limit;

      limit = offset + limit;

      if (tracks.length < limit)
        return;

      tracks = tracks.slice(offset, limit);

      $(tracks).each(function(i, v) {
        var cells = [];

        var columns = ["artistName", "trackName", "releaseDate", "trackPrice", "previewUrl"];

        for (var c = 0; c < columns.length; c++)
          cells.push(v[columns[c]].toString());

        state.data.push(cells);
      });

      $("#spinner").remove();

      grid.setState(state);
    });
  };

  pageboot('basic');

  $("#pager-basic").on("click", function(){
    pageboot('basic');
  });

  $("#pager-infinite").on("click", function(){
    pageboot('infinite');
  });
})();
