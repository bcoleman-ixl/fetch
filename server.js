const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', (req, res) => {
  db.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('index.ejs', {
      templates: result
    })
  })
})

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public/'));



// Sets up Mongo Client
var db
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

app.put('/template-update', (req, res) => {
  db.collection('templates')
    .findOneAndUpdate({
      name: req.body.findName
    }, {
      $set: {
        name: req.body.newName,
      }
    }, {
      sort: {
        _id: -1
      },
      upsert: false
    }, (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    })
})
