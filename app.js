/**
 * Node.js app for curating and copying
 * tempaltes for customer facing e-mails.
 *
 * By Bryce Coleman
 *
 */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

/* Connecting to Mongo database */
const mongoose = require('mongoose');
const usersClient = require('mongoose');
const templatesClient = require('mongodb').MongoClient;
let templatesDb = null;
let usersDb = null;

/* User authentication */
const User = require('./models/user-model');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

/**
 * Checking if users have been authenticated
 * Redirect to authenticate if user is null
 */
const authCheck = (req, res, next) => {
  if (!req.user) {
    res.redirect('/authenticate');
  } else {
    next();
  }
}

/* Checking if user is admin, redirect if not */
const authCheckAdmin = (req, res, next) => {
  if (req.user == null || req.user.type != 'admin') {
    res.redirect('/authenticate');
  } else {
    next();
  }
}

/**
 * Use embedded Javascript as the view engine
 * Use JSON to store object data
 */
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/* Use cookies with max age of 20 hours */
app.use(cookieSession({
  maxAge: 20 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

/* Use passport for user authentication */
app.use(passport.initialize());
app.use(passport.session());

/* Use directories*/
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/img/'));

/* Connect to templates database and grab template list for displaying in index.ejs */
templatesClient.connect(keys.mongoDb.templatesURI, (err, client) => {
  if (err) return console.log(err);
  templatesDb = client.db('templates');
  // Listen on port 3000
  app.listen(3000);
});

/* Connects to users database*/
mongoose.connect(keys.mongoDb.usersURI, () => {});

/* Adds the template to the database */
app.post('/add', (req, res) => {
  templatesDb.collection('templates').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/templates')
  })
});

/**
 * Finds template by ID and removes
 * it from the database.
 */
app.delete('/remove', (req, res) => {
  templatesDb.collection('templates').findOneAndDelete({
      id: req.body.id
    },
    (err, result) => {
      if (err) return res.send(500, err)
      res.send({
        message: 'Removed'
      })
    })
});

/**
 * Finds template by ID and updates
 * it in the database. Updated date will
 * always be todays date.
 */
app.put('/update', (req, res) => {
  templatesDb.collection('templates')
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
        team: req.body.team,
        public: req.body.public,
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

/**
 * Finds template by ID and
 * updates ranking. Fires each
 * time the template is copied.
 */
app.put('/updateRanking', (req, res) => {
  templatesDb.collection('templates')
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

/* Authentication */
// TODO: Add comments
passport.serializeUser((user, done) => {
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
        // Already have user
        console.log('existing user:' + currentUser);
        done(null, currentUser);
      } else {
        // Create a new user
        new User({
          name: profile.name.givenName,
          googleID: profile.id,
          img: profile._json.image.url,
          team: 'techSupport',
          type: 'user',
          email: profile.emails[0].value
        }).save().then((newUser) => {
          console.log('new user created *******' + newUser);
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
  res.redirect('/templates');
});

app.get('/templates', authCheck, (req, res) => {
  templatesDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // Renders index.ejs and loads templates and user profile
    res.render('index.ejs', {
      templates: result,
      user: req.user
    })
  })
});

app.get('/admin', authCheckAdmin, (req, res) => {
  templatesDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // Renders admin.ejs and loads tempaltes and user profile
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
  res.redirect('/templates');
});