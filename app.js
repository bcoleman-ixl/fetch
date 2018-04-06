// App
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const usersClient = require('mongoose');
const itemsClient = require('mongodb').MongoClient;
let itemsDb = null;
let usersDb = null;

// Authentication
const User = require('./models/user-model');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.redirect('/authenticate');
  } else {
    next();
  }
}
const authCheckAdmin = (req, res, next) => {
  if (req.user == null || req.user.type != 'admin') {
    res.redirect('/authenticate');
  } else {
    next();
  }
}

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

// intialize passport
app.use('/favicon.ico', express.static('/favicon.ico'));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/img/'));


// Connects to 'users' and 'items' databases

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

// Authenticate

// This happens after done is called below
passport.serializeUser((user, done) => {
  //grab info from users to jam into cookie
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  })
});

passport.use(new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile.emails[0].value);
    User.findOne({
      googleID: profile.id
    }).then((currentUser) => {
      if (currentUser) {
        // alread have user
        console.log('existing user:' + currentUser);
        done(null, currentUser);
      } else {
        // create a new user
        new User({
          name: profile.name.givenName,
          googleID: profile.id,
          img: profile._json.image.url,
          team: 'techSupport',
          type: 'user',
          email: profile.emails[0].value
        }).save().then((newUser) => {
          console.log('new user creatd *******' + newUser);
          done(null, newUser);
        });
      }
    });
  }
));

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  //res.send(req.user);
  res.redirect('/items');
});

app.get('/items', authCheck, (req, res) => {
  itemsDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('index.ejs', {
      templates: result,
      user: req.user
    })
  })
});

app.get('/admin', authCheckAdmin, (req, res) => {
  itemsDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // renders index.ejs
    res.render('admin.ejs', {
      templates: result,
      user: req.user
    })
  })
});

app.get('/authenticate', (req, res) => {
  // renders authenticate.ejs
  res.render('authenticate.ejs');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/authenticate');
});

app.get('/', (req, res) => {
  res.redirect('/items');
});