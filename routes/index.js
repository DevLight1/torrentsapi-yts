var express = require('express');
var router = express.Router();
var http = require('http');

function formatJson(json, pageNo){

  var newJson = json;

  // MovieList > movies
  newJson.movies = newJson.MovieList;
  delete newJson.MovieList;

  var movies = newJson.movies;
  for (var movie = 0, len = movies.length; movie < len; movie++) {

    var movieObj;
    movieObj = movies[movie];

    // title > title_english
    movieObj.title_english = movieObj.title;
    delete movieObj.title;

    // imdb > imdb_code
    movieObj.imdb_code = movieObj.imdb;
    delete movieObj.imdb;

    // poster_med > medium_cover_image
    movieObj.medium_cover_image = movieObj.poster_med;
    movieObj.large_cover_image = movieObj.poster_med;
    delete movieObj.poster_med;

    // poster_big > background_image_original
    movieObj.background_image_original = movieObj.poster_big;
    delete movieObj.poster_big;

    // description > description_full
    movieObj.description_full = movieObj.description;
    delete movieObj.description;

    // trailer > yt_trailer_code
    movieObj.yt_trailer_code = movieObj.trailer;
    delete movieObj.trailer;

    // items > torrents
    movieObj.torrents = movieObj.items;
    delete movieObj.items;

    var torrentObj = movieObj.torrents;
    //TODO: gotta cycle through torrents here
    for (var torrent = 0; torrent < torrentObj.length; torrent++) {

      // torrent_url > url
      torrentObj[torrent].url = torrentObj[torrent].torrent_url;
      delete torrentObj[torrent].torrent_url;

      // id > hash
      torrentObj[torrent].hash = torrentObj[torrent].id;
      delete torrentObj[torrent].id;

      // size_bytes > size
      torrentObj[torrent].size = torrentObj[torrent].size_bytes;
      delete torrentObj[torrent].size_bytes;

      // torrent_seeds > seeds
      torrentObj[torrent].seeds = torrentObj[torrent].torrent_seeds;
      delete torrentObj[torrent].torrent_seeds;

      // torrent_peers > peers
      torrentObj[torrent].peers = torrentObj[torrent].torrent_peers;
      delete torrentObj[torrent].torrent_peers;

    }

  }

  newJson.status = "ok";
  newJson.status_message = "Query was successful";

  var dataArray;
  dataArray = {
    movie_count: newJson.movies.length,
    limit: newJson.movies.length,
    page_number: pageNo,
    movies: newJson.movies
  };

  delete newJson.movies;
  newJson.data = dataArray;

  newJson.meta = {
    server_time: 1438191104,
    server_timezone: "Pacific\/Auckland",
    api_version: 2,
    execution_time: "180.89 ms"
  };

  return newJson;

}

function conversion(res, url, pageNo){

  var newJson = [];
  var oldJson = [];
  var query;

  query = url.slice(28, url.length);

  console.log(query);
  // make request to api.torrentsapi.com
  var options = {
    host: 'api.torrentsapi.com',
    path: '/list?page=' + pageNo
  };

  var formatRequest = function(response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      oldJson = JSON.parse(str);
      newJson = formatJson(oldJson, pageNo);
      res.json(newJson);
      // console.log(str);
    });
  };

  http.request(options, formatRequest).end();

  // translate api to popcorntime format
  // res.json(newJson);

}

router.get('/api/v2/list_movies_pct.json', function(req, res, next) {
  conversion(res, req.originalUrl, req.query.page);
  // res.render('index', { title: 'Express' });
});

module.exports = router;
