
var rasterize = require('./lib/rasterize')
  , ratelimit = require('./lib/ratelimit')
  , utils = require('./lib/utils')
  , path = require('path')
  , join = path.join
  , fs = require('fs');

var dir = app.get('screenshots')
  , db = app.db;

/*
 * GET home page.
 */

app.get('/', function(req, res, next){
  res.render('index', { title: 'Express' });
});

/**
 * GET stats.
 */

app.get('/stats', function(req, res){
  db.hgetall('screenshot:stats', function(err, obj){
    if (err) return next(err);
    res.send(obj);
  });
});

/*
 * GET screenshot.
 */

app.get('/:url(*)', ratelimit(60, 10), function(req, res, next){
  var url = req.params.url;
  if (!url) return res.send(400);
  var id = utils.md5(url);
  var path = join(dir, id + '.png');
  console.log('screenshot - rasterizing %s', url);
  rasterize(url, path, function(err){
    if (err) return next(err);
    console.log('screenshot - rasterized %s', url);
    app.emit('screenshot', url, path, id);
    res.sendfile(path);
  });
});

