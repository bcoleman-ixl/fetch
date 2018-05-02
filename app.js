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
const favicon = require('serve-favicon');

// Constants and function for creating the updated date
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/* Connecting to Mongo database */
const mongoose = require('mongoose');
const usersClient = require('mongoose');
const templatesClient = require('mongodb').MongoClient;
const logsClient = require('mongodb').MongoClient;
let templatesDb = null;
let logsDb = null;

/* User authentication */
const User = require('./models/user-model');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const jsforce = require('jsforce');

/* IXL Folders */
const tsixl = 'Folder.Name = \'TS IXL\' OR ';
const tsixlreports = 'Folder.Name = \'TS IXL Reports, SS, emails\' OR ';
const tsixlsignin = 'Folder.Name = \'TS IXL Sign in issues\' OR ';
const tsixlskill = 'Folder.Name = \'TS IXL Skill issues\' OR ';
const tsixltemp = 'Folder.Name = \'TS IXL Temp\' OR ';
const tsl1ixl = 'Folder.Name = \'TS L1 IXL\' OR ';

/* Quia Folders */
const tsnge = 'Folder.Name = \'TS NGE\' OR ';
const tsnie = 'Folder.Name = \'TS NIE\' OR ';
const tsnjcl = 'Folder.Name = \'TS NJCL\' OR ';
const tsnje = 'Folder.Name = \'TS NJE\' OR ';
const tsnpe = 'Folder.Name = \'TS NSE\' OR ';
const tsqb = 'Folder.Name = \'TS QB\' OR ';
const tsqbstolen = 'Folder.Name = \'TS QB Stolen book keys\' OR ';
const tsqw = 'Folder.Name = \'TS QW\' OR ';
const tsqwaccounts = 'Folder.Name = \'TS QW Accounts\' OR ';
const tsqwclasses = 'Folder.Name = \'TS QW Classes\' OR ';
const tsqworg = 'Folder.Name = \'TS QW Other Organizations\' OR ';
const end = 'Folder.Name = \'End of the query\'';

// TODO: Work on adding program



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
app.use(favicon(__dirname + '/img/favicon.ico'));
/* Connect to templates database and grab template list for displaying in index.ejs */
templatesClient.connect(keys.mongoDb.templatesURI, (err, client) => {
  if (err) return console.log(err);
  templatesDb = client.db('templates');
  // Listen on port 3000
  app.listen(3000);
  console.log('listening on 3000');
});

logsClient.connect(keys.mongoDb.logsURI, (err, client) => {
  if (err) return console.log(err);
  logsDb = client.db('logs');
  // Listen on port 3001
  app.listen(3001);
  console.log('listening on 3001 for logs');
});

/* Connects to users database*/
mongoose.connect(keys.mongoDb.usersURI);


/* Adds the template to the database */
app.post('/add', (req, res) => {
  templatesDb.collection('templates').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('back')
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
  console.log(req.body.replyEmail);
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
        program: req.body.program,
        team: req.body.team,
        greeting: req.body.greeting,
        closing: req.body.closing,
        publicStatus: req.body.publicStatus,
        replyEmail: [req.body.replyEmail],
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

/**
 * Adds users search logs to the Database
 * @type {String}
 */
app.put('/updateLogs', (req, res) => {
  console.log('sending: ' + req.body.userSearch);
  logsDb.collection('logs')
    .update({
      userEmail: req.body.userEmail
    }, {
      $addToSet: {
        userSearch: req.body.userSearch
      }
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
    callbackURL: keys.google.callbackURL
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

        logsDb.collection('logs').insert({
          userEmail: profile.emails[0].value,
          userSearch: []
        });
        // Create a new user
        new User({
          name: profile.name.givenName,
          googleID: profile.id,
          img: profile._json.image.url,
          team: 'techSupport',
          programs: ['IXL'],
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
    scope: ['profile', 'email'],
    prompt: 'select_account'
  }));

app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect('/templates');
});

app.get('/templates', authCheck, (req, res) => {
  var formCode = `<h2>Testing</h2>`;
  templatesDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err)
    // Renders index.ejs and loads templates and user profile
    res.render('index.ejs', {
      templates: result,
      user: req.user,
      form: formCode
    })
  })
});


app.get('/admin', authCheckAdmin, (req, res) => {
  templatesDb.collection('templates').find().toArray((err, result) => {
    if (err) return console.log(err);
    var myVar = 1;
    console.log(myVar);
    // Renders admin.ejs and loads tempaltes and user profile
    res.render('admin.ejs', {
      myVar: myVar,
      templates: result,
      user: req.user
    })
  })
});

app.get('/admin/logs', authCheckAdmin, (req, res) => {
  logsDb.collection('logs').find().toArray((err, result) => {
    if (err) return console.log(err)
    // Renders admin.ejs and loads tempaltes and user profile
    res.render('logs.ejs', {
      logs: result,
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

/**
 * Retrieve templates from Salesforce
 */
var conn = new jsforce.Connection({
  oauth2: {
    // you can change loginUrl to connect to sandbox or prerelease env.
    loginUrl: 'https://test.salesforce.com',
    clientId: keys.salesforce.clientId,
    clientSecret: keys.salesforce.clientSecret,
    redirectUri: keys.salesforce.redirectUri
  }
});

conn.login(keys.salesforce.username, keys.salesforce.password, function(err, userInfo) {
  if (err) {
    return console.error(err);
  }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log('Token: ' + conn.accessToken);
  console.log(conn.instanceUrl);


  conn.sobject("EmailTemplate")
    .select('Id, Name, HtmlValue, LastModifiedDate, IsActive, DeveloperName, Folder.Name')
    .where(
      tsixl +
      tsixlreports +
      tsixlsignin +
      tsixlskill +
      tsixltemp +
      tsl1ixl +
      end)
    .execute(function(err, records) {
      try {
        for (var i = 0; i < records.length; i++) {
          // Get individual record
          var record = records[i];
          var folder = record.Folder.Name;

          // Get and format last modified date
          var longDate = new Date(record.LastModifiedDate);
          var date = MONTH_NAMES[longDate.getMonth()] + ' ' + longDate.getDate() + ', ' + longDate.getFullYear();

          // Get the e-mail body in HTML and remove first sentence and after sincerely
          if (record.HtmlValue == null) {
            console.log('Body [[null]] for ' + record.Name);
          } else {
            var numberRegex = /\d*\.*\d*\s*(.*)/g;
            var name = numberRegex.exec(record.Name)[1];
            var body = record.HtmlValue;
            body = body.replace(/(\r\n|\n|\r)/gm, "");
            replyEmail = body.match(/([a-zA-Z0-9._-]+@ixl.com+)/gi)[0];

            function count(str) {
              var regex = /\s*<\s*br\s*\/>\s*<\s*br\s*\/\s*>/g;
              return ((str || '').match(regex) || []).length
            }

            var breakCount = count(body);
            var regexp = /\s*<\s*br\s*\/>\s*<\s*br\s*\/\s*>/g;

            var start = 0;
            var result = body.split(regexp).slice(start);
            var finalBody = [];
            var greeting = result[1];
            var closing = result[breakCount - 2];
            for (var k = 2; k < breakCount - 2; k++) {
              if (k == breakCount - 3) {
                finalBody.push(result[k]);
              } else {
                finalBody.push(result[k] + '<br /> <br />');
              }
            }

            finalBody = finalBody.join('');

          }
          // fields in Account relationship are fetched
          if (record.HtmlValue != null && record.IsActive == true) {
            templatesDb.collection('templates')
              .update({
                id: record.DeveloperName
              }, {
                $set: {
                  body: finalBody,
                  greeting: greeting,
                  closing: closing,
                  updatedDate: date,
                  addedByUser: 'salesforce@salesforce.com',
                  team: 'techSupport',
                  publicStatus: 'true',
                  program: 'IXL',
                  replyEmail: replyEmail,
                  folder: folder
                }
              }, {
                upsert: true
              }) // End of update statement
          } // End of if statement
        } // End of for loop
      } catch (e) {
        console.log(e);
      }
    }) // End of query

  conn.sobject("EmailTemplate")
    .select('Id, Name, Body, LastModifiedDate, IsActive, DeveloperName, Folder.Name')
    .where(
      tsnge +
      tsnie +
      tsnjcl +
      tsnje +
      tsnpe +
      tsqw +
      tsqwaccounts +
      tsqwclasses +
      tsqworg +
      end)
    .execute(function(err, records) {
      try {
        // Select program based on Folder name

        for (var i = 0; i < records.length; i++) {
          // Get individual record
          var record = records[i];
          var folder = record.Folder.Name;
          // Get and format last modified date
          var longDate = new Date(record.LastModifiedDate);
          var date = MONTH_NAMES[longDate.getMonth()] + ' ' + longDate.getDate() + ', ' + longDate.getFullYear();

          // Get the e-mail body in HTML and remove first sentence and after sincerely
          if (record.Body == null) {
            console.log('Body [[null]] for ' + record.Name);
          } else {
            var numberRegex = /\d*\.*\d*\s*(.*)/g;
            var name = numberRegex.exec(record.Name)[1];
            var body = record.Body;
            body = body.replace(/(\r\n|\n|\r)/gm, "</br>");
            body = body.toString();
            replyEmail = body.match(/([a-zA-Z0-9._-]+@quia.com)/gi);

            function count(str) {
              var regex = /<\/br><\/br>/g;
              return ((str || '').match(regex) || []).length
            }
            var breakCount = count(body);
            var result = body.split('</br></br>').slice();
            var finalBody = [];
            var greeting = result[1];
            var closing = result[breakCount - 1];
            for (var k = 2; k < breakCount - 1; k++) {
              if (k == breakCount - 2) {
                finalBody.push(result[k]);
              } else {
                finalBody.push(result[k] + '<br/><br/>');
              }
            }
            finalBody = finalBody.join('');

          }
          // fields in Account relationship are fetched
          if (record.Body != null && record.IsActive == true) {
            templatesDb.collection('templates')
              .update({
                id: record.DeveloperName
              }, {
                $set: {
                  body: finalBody,
                  greeting: greeting,
                  closing: closing,
                  updatedDate: date,
                  addedByUser: 'salesforce@salesforce.com',
                  team: 'techSupport',
                  publicStatus: 'true',
                  program: 'QW',
                  replyEmail: replyEmail,
                  folder: folder
                }
              }, {
                upsert: true
              }) // End of update statement
          } // End of if statement
        } // End of for loop
      } catch (e) {
        console.log(e);
      }
    }) // End of query


  conn.sobject("EmailTemplate")
    .select('Id, Name, Body, LastModifiedDate, IsActive, DeveloperName, Folder.Name')
    .where(
      tsqb +
      tsqbstolen +
      end)
    .execute(function(err, records) {
      try {
        // Select program based on Folder name

        for (var i = 0; i < records.length; i++) {
          // Get individual record
          var record = records[i];
          var folder = record.Folder.Name;
          // Get and format last modified date
          var longDate = new Date(record.LastModifiedDate);
          var date = MONTH_NAMES[longDate.getMonth()] + ' ' + longDate.getDate() + ', ' + longDate.getFullYear();

          // Get the e-mail body in HTML and remove first sentence and after sincerely
          if (record.Body == null) {
            console.log('Body [[null]] for ' + record.Name);
          } else {
            var numberRegex = /\d*\.*\d*\s*(.*)/g;
            var name = numberRegex.exec(record.Name)[1];
            var body = record.Body;
            body = body.replace(/(\r\n|\n|\r)/gm, "</br>");
            body = body.toString();
            replyEmail = body.match(/([a-zA-Z0-9._-]+@quia.com+)/gi)[0];

            function count(str) {
              var regex = /<\/br><\/br>/g;
              return ((str || '').match(regex) || []).length
            }

            var breakCount = count(body);

            var result = body.split('</br></br>').slice();

            // Empty array for the final body
            var finalBody = [];
            var greeting = result[1];
            var closing = result[breakCount - 1];
            for (var k = 2; k < breakCount - 1; k++) {
              if (k == breakCount - 2) {
                finalBody.push(result[k]);
              } else {
                finalBody.push(result[k] + '<br/><br/>');
              }
            }
            finalBody = finalBody.join('');

          }
          // fields in Account relationship are fetched
          if (record.Body != null && record.IsActive == true) {
            templatesDb.collection('templates')
              .update({
                id: record.DeveloperName
              }, {
                $set: {
                  body: finalBody,
                  greeting: greeting,
                  closing: closing,
                  updatedDate: date,
                  addedByUser: 'salesforce@salesforce.com',
                  team: 'techSupport',
                  publicStatus: 'true',
                  program: 'QB',
                  replyEmail: replyEmail,
                  folder: folder
                }
              }, {
                upsert: true
              }) // End of update statement
          } // End of if statement
        } // End of for loop
      } catch (e) {
        console.log(e);
      }
    }) // End of query

}); // End of  conn.login