const express = require('express');
const app = express();


var db;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(bodyParser());

// Sets up Mongo Client
const MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://helios-user:helios-user@ds125628.mlab.com:25628/templates', (err, client) => {
  if (err) return console.log(err)
  db = client.db('templates')
  app.listen(3000, function() {
    console.log('listening on 3000')
  })
})

// Posts form data to Mongo Client
app.post('/templates', (req, res) => {
  db.collection('templates').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
})
