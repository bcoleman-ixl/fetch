const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public/'));

// Connects to 'users' and 'templates' databases
const templatesClient = require('mongodb').MongoClient
const usersClient = require('mongodb').MongoClient

var templatesDb;
var usersDb;

templatesClient.connect('mongodb://templates-admin:templates-admin@ds125628.mlab.com:25628/templates', (err, client) => {
  if (err) return console.log(err)
  templatesDb = client.db('templates')
  app.listen(3000, function() {
    console.log('templates connected on 3001')
  })
});

usersClient.connect('mongodb://users-admin:users-admin@ds257858.mlab.com:57858/users', (err, client) => {
  if (err) return console.log(err)
  users = client.db('templates')
  app.listen(3001, function() {
    console.log('users connected on 3000')
  })
});

// Posts form data to Mongo Client
app.post('/add-template', (req, res) => {
  templatesDb.collection('templates').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
});

app.delete('/quotes', (req, res) => {
  console.log(req.body.name)
  templatesDb.collection('templates').findOneAndDelete({
      name: req.body.name
    },
    (err, result) => {
      if (err) return res.send(500, err)
      res.send({
        message: 'A darth vadar quote got deleted'
      })
    })
});


/*app.put('/update', (req, res) => {
  console.log(req.body.findName);
  console.log(req.body.newName);
  templatesDb.collection('templates')
    .findOneAndUpdate({
      name: req.body.findName
    }, {
      $set: {
        name: req.body.newName,
      }
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
});
//still working on */

app.get('/', (req, res) => {
  templatesDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('index.ejs', {
      templates: result
    })
  })
});
