/* */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const keys = require('./config/keys');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const mongoose = require('mongoose');
const User = require('./models/user-model');
const usersClient = require('mongoose');
const itemsClient = require('mongodb').MongoClient;


app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/img'));


// Connects to 'users' and 'items' databases
var itemsDb;
var usersDb;

itemsClient.connect(keys.mongoDb.itemsURI, (err, client) => {
  if (err) return console.log(err)
  itemsDb = client.db('templates')
  app.listen(3000, function() {
    console.log('itemsDb connected on 3000')
  })
});

mongoose.connect(keys.mongoDb.usersURI, () => {
  console.log('connected to users');
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
  itemsDb.collection('templates')
    .findOneAndUpdate({
      id: req.body.id
    }, {
      $set: {
        id: req.body.id,
        updatedDate: req.body.updatedDate,
        name: req.body.name,
        body: req.body.body,
        category: req.body.category,
        type: req.body.type,
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

app.put('/updateRanking', (req, res) => {
  itemsDb.collection('templates')
    .findOneAndUpdate({
      id: req.body.id
    }, {
      $set: {
        id: req.body.id,
        ranking: req.body.ranking
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

app.get('/items', function(req, res, next) {
  itemsDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('index.ejs', {
      templates: result
    })
  })

});

passport.use(new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOne({
      googleID: profile.id
    }).then((currentUser) => {
      if (currentUser) {
        // alread have user
        console.log('user is:' + currentUser);
      } else {
        // create a new user
        new User({
          name: profile.
          name.givenName,
          googleID: profile.id,
          profilePicURL: profile.photos.value,
          team: 'techSupport',
          type: 'user'
        }).save().then((newUser) => {
          console.log('new user creatd *******' + newUser);
        });
      }
    });
  }
));

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile']
  }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/google'
  }),
  function(req, res) {
    res.red
    irect('/items');
  });
