/* */
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const itemsClient = require('mongodb').MongoClient;
const usersClient = require('mongodb').MongoClient;

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public/'));

// Connects to 'users' and 'items' databases
var itemsDb;
var usersDb;

itemsClient.connect('mongodb://templates-admin:templates-admin@ds125628.mlab.com:25628/templates', (err, client) => {
  if (err) return console.log(err)
  itemsDb = client.db('templates')
  app.listen(3000, function() {
    console.log('itemsDb connected on 3000')
  })
});

usersClient.connect('mongodb://users-admin:users-admin@ds257858.mlab.com:57858/users', (err, client) => {
  if (err) return console.log(err)
  users = client.db('users')
  app.listen(3001, function() {
    console.log('usersDb connected on 3001')
  })
});

// Posts form data to Mongo Client
app.post('/add', (req, res) => {
  itemsDb.collection('templates').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/items')
  })
});

app.delete('/remove', (req, res) => {
  itemsDb.collection('templates').findOneAndDelete({
      id: req.body.id
    },
    (err, result) => {
      if (err) return res.send(500, err)
      res.send({
        message: 'Removed'
      })
    })
});

app.put('/update', (req, res) => {
  console.log('ID: ' + req.body.id);
  console.log('Name: ' + req.body.name);
  itemsDb.collection('templates')
    .findOneAndUpdate({
      id: req.body.id
    }, {
      $set: {
        name: req.body.name,
        body: req.body.body,
        tags: req.body.tags
      }
    }, {
      sort: {
        _id: -1
      },
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
});

app.get('/items', (req, res) => {
  itemsDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('index.ejs', {
      templates: result
    })
  })
});

app.get('/users', (req, res) => {
  itemsDb.collection('users').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders users.ejs
    res.render('users.ejs', {
      templates: result
    })
  })
});
