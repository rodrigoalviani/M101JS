'use strict';

var app = require('express')(),
  bodyParser = require('body-parser'),
  nunjucks = require('nunjucks'),
  MongoClient = require('mongodb').MongoClient;

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use(bodyParser.urlencoded({extended: true}));

function errorHandler (err, req, res, next) {
  console.error(err.message);
  console.error(err.stack);
  res.status(500).render('error.html', {error: err.message});
}

app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('/movies/add', function (req, res) {
  res.render('movies.html', {form: true});
});

app.post('/movies', function (req, res, next) {
  var movie = {
    'title': req.body.title,
    'year': req.body.year,
    'imdb': req.body.imdb
  };

  if (!movie.title) return next(Error('Missing Title!'));
  if (!movie.year) return next(Error('Missing Year!'));
  if (!movie.imdb) return next(Error('Missing IMDb!'));

  MongoClient.connect('mongodb://localhost:27017/video', function (err, db) {
    if (err) return next(Error('Error connecting to MongoDB'));

    var collection = db.collection('movies');
    collection.insertOne(movie, function (err, doc) {
      db.close();
      if (err) return next(doc);
      res.status(201).render('movies.html', {added: true, title: movie.title});
    });
  });
});



app.use(function (req, res) {res.sendStatus(404);});
app.use(errorHandler);

app.listen(3000, function () {
  console.log('Server up on 3000!');
});