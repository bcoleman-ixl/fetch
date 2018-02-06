const express = require('express');
const app = express();


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));

var db;

const MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://helios-user:helios-user@ds225608.mlab.com:25608/helios-drafts', (err, client) => {
  if (err) return console.log(err)
  db = client.db('helios-drafts')
  app.listen(3000, function() {
    console.log('listening on 3000')
  })
})

app.post('/drafts', (req, res) => {
  db.collection('drafts').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
})
