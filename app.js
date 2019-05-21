/**
 * Node.js app for curating and copying
 * templates for customer facing e-mails.
 *
 *
 * By Bryce Coleman
 *
 */
express = require('express');
const app = express();
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const mysql = require('mysql');

// Constants and function for creating the updated date
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/* Connecting to Mongo database */
const mongoose = require('mongoose');
var mongoUtil = require('./mongoUtil');
var fetchDb = null;
const usersClient = require('mongodb').MongoClient;
let usersDb = null;

/* User authentication */
const User = require('./models/user-model');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const jsforce = require('jsforce');

var currency = [];
var licenses = [];
var subjects = [];
var queues = [];

/* Programs for the application
IXL - IXL
QW - Quia Web
QB - Quia Books
CSE - Customer Support Engineer
FAM - Family
AS - Account services
AM - Account managers
TM - Teacher memberships
*/
const programs = [
  'AM',
  'AS',
  'CSE',
  'FAM',
  'IXL',
  'QB',
  'QW',
  'TM'
];

const teams = [
  'accountServices',
  'customerSupportEngineer',
  'family',
  'teacherMemberships',
  'techSupport',
  'techSupportNew'
];

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

/**
 * Checking if is new
 */
const newUserCheck = (req, res, next) => {
  if (req.user.team != 'newTeam') {
    res.redirect('/');
  } else {
    next();
  }
}

/**
 * Checking if users have been authenticated
 * Redirect to authenticate if user is null
 */
const authCheckSession = (req, res, next) => {
  if (!req.user) {
    res.redirect('back');
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
  maxAge: 72 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

/* Use passport for user authentication */
app.use(passport.initialize());
app.use(passport.session());

/* Use directories*/
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/config/'));
app.use(express.static(__dirname + '/img/'));
app.use(express.static(__dirname + '/backup/'));
app.use(favicon(__dirname + '/img/favicon.ico'));

const port = 3000;
app.listen(port);

mongoUtil.connectToServer(function(err) {
  fetchDb = mongoUtil.getDb();
  if (err) {
    console.log(err);
  }
});

var con = mysql.createConnection({
  host: '192.168.18.229',
  port: '3306',
  user: 'bcoleman',
  password: 'aep4eiJ6',
  database: 'fetchdb',
  multipleStatements: true
});

con.connect(function(err) {
  if (err) throw err;
});

var query = 'SELECT licenses.countryCode,licenses.type, currency.subjectQuantityMax,licenses.subjectQuantity, licenses.numberLicenses, licenses.cost, licenses.rebateId, licenses.rebateCost, rebates.rebateName, rebates.rebateEndDate, currency.currencySymbol, currency.currencyCode, subjects.subjectQuantityName, licenses.spanishCost, licenses.id FROM `licenses` INNER JOIN `subjects` ON licenses.subjectQuantity = subjects.subjectQuantity INNER JOIN `currency` ON licenses.countryCode = currency.countryCode OR licenses.countryCode = currency.subjectQuantityMax OR licenses.countryCode = currency.currencyCode INNER JOIN `rebates` ON licenses.rebateId = rebates.rebateId ORDER BY countryCode DESC, type ASC, subjectQuantity ASC, numberLicenses ASC; SELECT * FROM currency ORDER BY countryCode; SELECT * FROM subjects; SELECT * FROM objects; SELECT * FROM rebates';

/* Connects to users database*/
mongoose.connect(keys.mongoDb.usersURI);

app.get('/home', authCheck, (req, res) => {
  fetchDb.collection('templates').find().toArray((err, result) => {
    con.query(query, [1, 2, 3, 4], function(error, results, fields) {
      var route = 'home';
      if (err) {
        return console.log(err);
      }

      // Renders index.ejs and loads templates and user profile
      var userTemplates = [];
      for (var i = 0; i < result.length; i++) {
        for (var m = 0; m < req.user.programs.length; m++) {
          if (result[i].program == req.user.programs[m]) {
            if (result[i].publicStatus == 'true' || (result[i].publicStatus == 'false' && result[i].addedByUser == req.user.email)) {
              if ((req.user.team == 'techSupportNew' && result[i].folder == 'IXL TS L1') || (req.user.team != 'techSupportNew')) {
                userTemplates.push(result[i]);
              }
            }
          }
        }
      }
      userTemplates.sort(compare);

      res.render('index.ejs', {
        subtitle: '',
        templatesArr: userTemplates,
        user: req.user,
        settings: JSON.parse(JSON.stringify(req.user)).settings,
        programs: programs,
        licenses: results[0],
        currency: results[1],
        subjects: results[2],
        objects: results[3],
        route: 'home',
        countLimit: 17
      })
    });
  })
});

app.get('/knowledge', authCheck, (req, res) => {
  fetchDb.collection('knowledge').find().toArray((err, result) => {
    if (err) return console.log(err)
    // Renders index.ejs and loads templates and user profile
    var knowledgeBase = [];
    for (var i = 0; i < result.length; i++) {
      if (true) {
        knowledgeBase.push(result[i]);
      }

    }
    res.render('knowledge.ejs', {
      subtitle: 'Knowledge Base',
      route: 'knowledge',
      knowledgeBase: knowledgeBase,
      user: req.user,
      settings: JSON.parse(JSON.stringify(req.user)).settings,
      programs: programs
    })
  })
});

app.get('/templateDetails', authCheck, (req, res) => {
  fetchDb.collection('templates').find().toArray((err, result) => {
    con.query(query, [1, 2, 3, 4], function(error, results, fields) {
      if (err) return console.log(err)
      // Renders index.ejs and loads templates and user profile
      var userTemplates = [];
      for (var i = 0; i < result.length; i++) {
        for (var m = 0; m < req.user.programs.length; m++) {
          if (result[i].program == req.user.programs[m]) {
            if (result[i].publicStatus == 'true' || result[i].publicStatus == 'false') {
              userTemplates.push(result[i]);
            }
          }
        }
      }
      res.render('templateDetails.ejs', {
        subtitle: 'Template details',
        route: 'templateDetails',
        templatesArr: userTemplates,
        user: req.user,
        settings: JSON.parse(JSON.stringify(req.user)).settings,
        programs: programs,
        licenses: results[0],
        currency: results[1],
        subjects: results[2],
        objects: results[3],
        route: 'templateDetails',
        countLimit: 17
      })
    });
  })
});

app.get('/newUser', newUserCheck, (req, res) => {
  // renders authenticate.ejs
  res.render('newUser.ejs', {
    route: 'newUser',
    user: req.user,
    teams: teams,
    programs: programs
  });
});

app.get('/personalTemplates', authCheck, (req, res) => {
  fetchDb.collection('templates').find().toArray((err, result) => {
    con.query(query, [1, 2, 3, 4], function(error, results, fields) {

      if (err) return console.log(err)
      // Renders index.ejs and loads templates and user profile
      var userTemplates = [];
      for (var i = 0; i < result.length; i++) {
        for (var m = 0; m < req.user.programs.length; m++) {
          if (result[i].program == req.user.programs[m] && (result[i].publicStatus == 'false' || result[i].publicStatus == 'hide')) {
            userTemplates.push(result[i]);
          }
        }
      }
      userTemplates.sort(compare);
      res.render('index.ejs', {
        route: 'personalTemplates',
        subtitle: 'Personal templates',
        templatesArr: userTemplates,
        user: req.user,
        programs: programs,
        licenses: results[0],
        currency: results[1],
        subjects: results[2],
        objects: results[3],
        route: 'personalTemplates',
        countLimit: 1000
      })
    });
  })
});

app.get('/quotes', authCheck, (req, res) => {
  con.query(query, [1, 2, 3, 4, 5], function(error, results, fields) {
    res.render('quotes.ejs', {
      subtitle: '',
      route: 'quotes',
      user: req.user,
      programs: programs,
      licenses: results[0],
      currency: results[1],
      subjects: results[2],
      objects: results[3],
      rebates: results[4]
    })
  });
});

app.get('/userGuide', function(req, res) {
  res.redirect('https://docs.google.com/document/d/12taMlvNPy3oJe8amdPj7wn_uwSssGF0UC_Z82I3cYUQ/edit#heading=h.qwiv98ort26c');


});

app.get('/templates', function(req, res) {
  res.redirect('/home');
});

app.get('/userProfiles', authCheck, (req, res) => {
  fetchDb.collection('users').find().toArray((err, result) => {
    if (err) return console.log(err)
    // Renders userProfiles.ejs and loads tempaltes and user profile
    res.render('userProfiles.ejs', {
      route: 'userProfiles',
      subtitle: 'User profiles',
      users: result,
      user: req.user,
      programs: programs
    })
  })
});

app.get('/jsonTemplates', authCheck, (req, res) => {
  fetchDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // Renders userProfiles.ejs and loads tempaltes and user profile
    res.render('jsonTemplates.ejs', {
      route: 'JSONTemplates',
      subtitle: 'Templates as JSON',
      users: result,
      user: req.user,
      programs: programs
    })
  })
});

app.get('/yourTeam', authCheck, (req, res) => {
  res.render('yourTeam.ejs', {
    route: 'yourTeam',
    user: req.user
  })
});


app.get('/authenticate', (req, res) => {
  res.redirect('/auth/google');
});

app.get('/logout', (req, res) => {
  req.session.cookieKey = null;
  req.session.user = null;
  req.logout();
  res.render('logout.ejs');
});

app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/review', authCheckAdmin, (req, res) => {
  fetchDb.collection('templates').find().toArray((err, result) => {
    con.query(query, [1, 2, 3, 4], function(error, results, fields) {

      if (err) return console.log(err)
      // Renders review.ejs and loads templates and user profile
      var userTemplates = [];
      for (var i = 0; i < result.length; i++) {

        if (result[i].vetted == 'No' && result[i].publicStatus == 'true' && result[i].program == 'QW') {
          userTemplates.push(result[i]);
        }

      }
      res.render('review.ejs', {
        templatesArr: userTemplates,
        user: req.user,
        programs: programs,
        licenses: results[0],
        currency: results[1],
        subjects: results[2],
        objects: results[3]
      })
    });
  })
});


// Create, update, and delete routes for templates and knowledge base articles
app.post('/createArticle', (req, res) => {
  console.log(req.body);
  fetchDb.collection('knowledge').save(req.body, (err, result) => {
    if (err) {
      return console.log(err)
    } else {
      res.send('success');
    }
  })
});

app.put('/updateArticle', (req, res) => {
  fetchDb.collection('knowledge')
    .findOneAndUpdate({
      id: req.body.id
    }, {
      $set: {
        id: req.body.id,
        updatedDate: req.body.updatedDate,
        lastUpdatedByUser: req.body.lastUpdatedByUser,
        name: req.body.name,
        body: req.body.body,
        category: req.body.category,
        program: req.body.program,
        team: req.body.team,
        greeting: req.body.greeting,
        closing: req.body.closing,
        publicStatus: req.body.publicStatus,
        vetted: req.body.vetted,
        replyEmail: [req.body.replyEmail],
        tags: req.body.tags,
        versions: req.body.versions
      }
    }, {
      sort: {
        _id: -1
      },
      upsert: true
    }, (err, result) => {

      if (err) return res.send(err)
      res.send(result);
    })
});

app.delete('/deleteArticle', (req, res) => {
  fetchDb.collection('knowledge').findOneAndDelete({
      id: req.body.id
    },
    (err, result) => {
      if (err) return res.send(500, err)
      res.send({
        message: 'Deleted'
      })
    })
});

app.post('/createTemplate', (req, res) => {
  console.log(req.body);
  fetchDb.collection('templates').save(req.body, (err, result) => {
    if (err) {
      return console.log(err)
    } else {
      res.send('success');
    }
  })
});

app.put('/updateTemplate', (req, res) => {
  fetchDb.collection('templates')
    .findOneAndUpdate({
      id: req.body.id
    }, {
      $set: {
        id: req.body.id,
        updatedDate: req.body.updatedDate,
        lastUpdatedByUser: req.body.lastUpdatedByUser,
        name: req.body.name,
        body: req.body.body,
        category: req.body.category,
        program: req.body.program,
        team: req.body.team,
        greeting: req.body.greeting,
        closing: req.body.closing,
        publicStatus: req.body.publicStatus,
        vetted: req.body.vetted,
        replyEmail: [req.body.replyEmail],
        tags: req.body.tags,
        versions: req.body.versions
      }
    }, {
      sort: {
        _id: -1
      },
      upsert: true
    }, (err, result) => {

      if (err) return res.send(err)
      res.send(result);
    })
});

app.delete('/deleteTemplate', (req, res) => {
  fetchDb.collection('templates').findOneAndDelete({
      id: req.body.id
    },
    (err, result) => {
      if (err) return res.send(500, err)
      res.send({
        message: 'Deleted'
      })
    })
});

// Create, update, and delete routes for licenses
app.put('/createLicense', (req, res) => {
  var sql = `INSERT INTO licenses (cost, countryCode, type, spanishCost, subjectQuantity, numberLicenses, rebateCost, rebateId) VALUES (${req.body.cost}, "${req.body.countryCode}", "${req.body.type}", ${req.body.spanishCost},${req.body.subjectQuantity}, ${req.body.numberLicenses}, ${req.body.rebateCost},"${req.body.rebateId}")`;
  con.query(sql, function(err, result) {
    console.log(err);
  });
  window.location.reload()
});

app.put('/updateLicense', (req, res) => {
  var sql = `UPDATE licenses SET cost = ${req.body.cost}, countryCode = "${req.body.countryCode}",  type = "${req.body.type}", subjectQuantity = ${req.body.subjectQuantity}, numberLicenses = ${req.body.numberLicenses}, rebateCost = ${req.body.rebateCost},  rebateId = "${req.body.rebateId}", spanishCost = ${req.body.spanishCost} WHERE id
   = ${req.body.id} `
  con.query(sql, function(err, result) {
    console.log(err);
  });
});

app.put('/deleteLicense', (req, res) => {
  var sql = "DELETE FROM licenses WHERE id = " + req.body.id;
  con.query(sql, function(err, result) {});
});


// Update and delete routes for users and templates
app.put('/updateTemplateJSON', (req, res) => {
  var id = req.body.id;
  var jsonObj = req.body.jsonObj;
  jsonObj = JSON.parse(jsonObj);
  try {
    fetchDb.collection('templates').replaceOne({
        "id": id
      },
      jsonObj, {
        upsert: false
      }

    )
  } catch (e) {
    console.log('error');
    console.log(e);
  }
});

app.delete('/deleteTemplate', (req, res) => {
  var id = req.body.id;
  try {
    fetchDb.collection('templates').deleteOne({
        "id": id
      }, {
        upsert: false
      }

    )
  } catch (e) {
    console.log(e);
  }
});

app.put('/updateUser', (req, res) => {
  var googleID = req.body.googleID;

  var jsonObj = req.body.jsonObj;
  jsonObj = JSON.parse(jsonObj);
  console.log(jsonObj);
  try {
    fetchDb.collection('users').replaceOne({
        "googleID": googleID
      },
      jsonObj, {
        upsert: false
      }

    )
  } catch (e) {
    console.log('error');
    console.log(e);
  }
});

app.delete('/deleteUser', (req, res) => {
  var googleID = req.body.googleID;
  try {
    fetchDb.collection('users').deleteOne({
        "googleID": googleID
      }, {
        upsert: false
      }

    )
  } catch (e) {
    console.log(e);
  }
});

app.put('/updateNewUser', authCheck, (req, res) => {
  fetchDb.collection('users')
    .findOneAndUpdate({
      googleID: req.body.googleID
    }, {
      $set: {
        programs: req.body.programs,
        team: req.body.team
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
});
// Update ranking and dark mode routes
app.put('/updateRanking', (req, res) => {
  fetchDb.collection('templates')
    .findOneAndUpdate({
      id: req.body.id
    }, {
      $set: {
        ranking: req.body.ranking,
        copyFull: req.body.copyFull,
        copyPortion: req.body.copyPortion
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

app.put('/updateDarkMode', (req, res) => {
  fetchDb.collection('users')
    .findOneAndUpdate({
      email: req.body.email
    }, {
      $set: {
        "settings.darkMode": req.body.darkModeValue
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
    callbackURL: keys.google.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({
      googleID: profile.id
    }).then((currentUser) => {
      if (currentUser) {
        // Already have user
        done(null, currentUser);
      } else {
        new User({
          name: profile.name.givenName,
          googleID: profile.id,
          img: profile._json.image.url,
          team: 'newTeam',
          programs: ['Welcome'],
          type: 'user',
          vettingRights: false,
          settings: {
            darkMode: false,
            signature: true
          },
          email: profile.emails[0].value
        }).save().then((newUser) => {
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


app.get('/auth/google/callback',
  passport.authenticate('google'), // complete the authenticate using the google strategy
  (err, req, res, next) => { // custom error handler to catch any errors, such as TokenError
    if (err.name === 'TokenError') {
      res.redirect('/auth/google'); // redirect them back to the login page
    } else {

    }
  },
  (req, res) => { // On success, redirect back to '/'
    res.redirect('/newUser');
  }
);

function compare(a, b) {
  if (a.ranking < b.ranking) {
    return -1;
  }
  if (a.ranking > b.ranking) {
    return 1;
  }
  return 0;
}

function reviewCompare(a, b) {
  if (a.folder < b.folder) {
    return 1;
  }
  if (a.folder > b.folder) {
    return -1;
  }
  return 0;
}

function format(body) {
  body = body.replace(/<br>/, "");
  body = body.replace(/<div><br><\/div>/g, "<br/>");
  body = body.replace(/<\/div>/g, "");
  body = body.replace(/<div>/g, "<br/>");
  body = body.replace(/ \"body\": "<br\/>/g, "\"body\": \"");
  body = body.replace(/&nbsp;/g, "");
  if (body.substring(0, 5) == "<br/>") {
    body = body.substring(5);
  }
  return body;
}