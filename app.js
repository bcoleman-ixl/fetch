/**
 * Node.js app for curating and copying
 * templates for customer facing e-mails.
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
const templatesClient = require('mongodb').MongoClient;
const usersClient = require('mongodb').MongoClient;
let templatesDb = null;
let usersDb = null;

/* User authentication */
const User = require('./models/user-model');
const cookieSession = require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const jsforce = require('jsforce');

/* IXL folders */
const tsixl = 'Folder.Name = \'TS IXL\' OR ';
const tsixlreports = 'Folder.Name = \'TS IXL Reports, SS, emails\' OR ';
const tsixlsignin = 'Folder.Name = \'TS IXL Sign in issues\' OR ';
const tsixlskill = 'Folder.Name = \'TS IXL Skill issues\' OR ';
const tsixltemp = 'Folder.Name = \'TS IXL Temp\' OR ';
const tsl1ixl = 'Folder.Name = \'TS L1 IXL\' OR ';
const tsixldeletion = 'Folder.Name = \'TS IXL Deletion\' OR ';

/* Quia Web folders */
const tsnge = 'Folder.Name = \'TS NGE\' OR ';
const tsnie = 'Folder.Name = \'TS NIE\' OR ';
const tsnjcl = 'Folder.Name = \'TS NJCL\' OR ';
const tsnje = 'Folder.Name = \'TS NJE\' OR ';
const tsnpe = 'Folder.Name = \'TS NSE\' OR ';
const tsqw = 'Folder.Name = \'TS QW\' OR ';
const tsqwaccounts = 'Folder.Name = \'TS QW Accounts\' OR ';
const tsqwclasses = 'Folder.Name = \'TS QW Classes\' OR ';
const tsqworg = 'Folder.Name = \'TS QW Other Organizations\' OR ';
const tsqwdeletion = 'Folder.Name = \'TS QW Deletion\' OR ';

/* Quia Books folders */
// L2 QB Folders
const tsqb = 'Folder.Name = \'TS QB\' OR ';
const tsheinle = 'Folder.Name = \'TS Heinle Learning Center\' OR ';
const tsct = 'Folder.Name = \'TS Cheng & Tsui\' OR ';
// L1 QB Folders
const tsl1qb = 'Folder.Name = \'TS L1 Quia Books\' OR ';
const tsl1hlc = 'Folder.Name = \'TS L1 HLC\' OR ';
const tsl1ak = 'Folder.Name = \'TS L1 Al Kitaab\' OR ';
const tsl1ct = 'Folder.Name = \'TS L1 Cheng & Tsui\' OR ';

// Misc. QB Folders
const tsqbstolen = 'Folder.Name = \'TS QB Stolen book keys\' OR ';
const tsestudio = 'Folder.Name = \'TS eStudio\' OR ';
const tsalkitaab = 'Folder.Name = \'TS Al Kitaab\' OR ';
const tsqbdeletion = 'Folder.Name = \'TS QB Deletion\' OR ';

/* Family folders */
const famte = 'Folder.Name = \'Family Translated Editions\' OR ';
const famacct = 'Folder.Name = \'Family Account Changes\' OR ';
const famalt = 'Folder.Name = \'Family Alternative Payments\' OR ';
const famcancel = 'Folder.Name = \'Family Cancellations/Refund\' OR ';
const famfaq = 'Folder.Name = \'Family FAQs\' OR ';
const famhsbc = 'Folder.Name = \'Family HSBC\' OR ';
const fammobile = 'Folder.Name = \'Family Mobile Subscriptions\' OR ';
const famquote = 'Folder.Name = \'Family Quotes\' OR ';
const famspa = 'Folder.Name = \'Family Spanish\' OR ';

/* Account services folders */
const asfolder = 'Folder.Name = \'Account Services\' OR ';

const end = 'Folder.Name = \'End of the query\'';

var currency = [];
var licenses = [];
var subjects = [];
var queues = [];

/* Programs for the application
IXL - IXL
QW - Quia Web
QB - Quia Books
IXLT - IXL for Temps
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
  'IXLT',
  'QB',
  'QW',
  'TM'
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

/* Connect to templates database and grab template list for displaying in index.ejs */
templatesClient.connect(keys.mongoDb.templatesURI, (err, client) => {
  if (err) return console.log(err);
  templatesDb = client.db('templates');
  templatesDb.collection('templates').find().toArray((err, templatesArr) => {

    var fs = require('fs');
    var templatesBackupArr = [];
    for (var i = 0; i < templatesArr.length; i++) {
      if (templatesArr[i].program == "CSE") {

        templatesBackupArr.unshift(JSON.stringify(templatesArr[i], null, 4));
      }
    }
    //fs.writeFile("./backup/backup.json", templatesBackupArr);

  });
  // Listen on port 3000
  app.listen(3000);
});


/**
 * [con description]
 * @type {[type]}
 */

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


usersClient.connect(keys.mongoDb.usersURI, (err, client) => {
  if (err) return console.log(err);
  usersDb = client.db('users');
  // Listen on port 3001
  app.listen(3001);
});



/* Connects to users database*/
mongoose.connect(keys.mongoDb.usersURI);

app.get('/home', authCheck, (req, res) => {
  templatesDb.collection('templates').find().toArray((err, result) => {
    con.query(query, [1, 2, 3, 4], function(error, results, fields) {

      if (err) return console.log(err)
      // Renders index.ejs and loads templates and user profile
      var userTemplates = [];
      for (var i = 0; i < result.length; i++) {
        for (var m = 0; m < req.user.programs.length; m++) {
          if (result[i].program == req.user.programs[m]) {
            if (result[i].publicStatus == 'true' || (result[i].publicStatus == 'false' && result[i].addedByUser == req.user.email)) {

              userTemplates.push(result[i]);
            }
          }
        }
      }
      userTemplates.sort(compare);
      res.render('index.ejs', {
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


app.get('/admin', authCheck, (req, res) => {
  templatesDb.collection('templates').find().toArray((err, result) => {
    con.query(query, [1, 2, 3, 4], function(error, results, fields) {

      if (err) return console.log(err)
      // Renders index.ejs and loads templates and user profile
      var userTemplates = [];
      for (var i = 0; i < result.length; i++) {
        for (var m = 0; m < req.user.programs.length; m++) {
          if (result[i].program == req.user.programs[m] && result[i].publicStatus == 'false') {
            userTemplates.push(result[i]);
          }
        }
      }
      userTemplates.sort(compare);
      res.render('index.ejs', {
        templatesArr: userTemplates,
        user: req.user,
        programs: programs,
        licenses: results[0],
        currency: results[1],
        subjects: results[2],
        objects: results[3],
        route: 'admin',
        countLimit: 1000
      })
    });
  })
});

function compare(a, b) {
  if (a.ranking < b.ranking) {
    return -1;
  }
  if (a.ranking > b.ranking) {
    return 1;
  }
  return 0;
}

app.get('/review', authCheckAdmin, (req, res) => {
  templatesDb.collection('templates').find().toArray((err, result) => {
    con.query(query, [1, 2, 3, 4], function(error, results, fields) {

      if (err) return console.log(err)
      // Renders review.ejs and loads templates and user profile
      var userTemplates = [];
      for (var i = 0; i < result.length; i++) {
        for (var m = 0; m < req.user.programs.length; m++) {
          if (result[i].program == req.user.programs[m]) {
            userTemplates.push(result[i]);
          }
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

app.get('/queues', authCheckAdmin, (req, res) => {

  res.render('queues.ejs', {
    user: req.user,
    programs: programs,
    queues: queues
  })

});



app.get('/quotes', authCheck, (req, res) => {
  con.query(query, [1, 2, 3, 4, 5], function(error, results, fields) {
    res.render('quotes.ejs', {
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

app.get('/scruffy', authCheck, (req, res) => {

  res.render('scruffy.ejs', {

  })

});


app.get('/userGuide', function(req, res) {
  res.redirect('https://docs.google.com/document/d/12taMlvNPy3oJe8amdPj7wn_uwSssGF0UC_Z82I3cYUQ/edit#heading=h.qwiv98ort26c');

});

app.get('/users', authCheck, (req, res) => {
  usersDb.collection('users').find().toArray((err, result) => {
    if (err) return console.log(err)
    // Renders admin.ejs and loads tempaltes and user profile
    res.render('users.ejs', {
      users: result,
      user: req.user,
      programs: programs
    })
  })
});

/* Adds the template to the database */
app.post('/add', (req, res) => {
  req.body.body = format(req.body.body);
  templatesDb.collection('templates').save(req.body, (err, result) => {
    if (err) return console.log(err)
    res.redirect('back')
  })
});


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


app.put('/addLicense', (req, res) => {
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
 * Finds user by email and
 * updates darkMode.
 */
app.put('/updateDarkMode', (req, res) => {
  console.log(req.body.darkModeValue);
  usersDb.collection('users')
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
    User.findOne({
      googleID: profile.id
    }).then((currentUser) => {
      if (currentUser) {
        // Already have user
        done(null, currentUser);
      } else {
        // Create a new user
        new User({
          name: profile.name.givenName,
          googleID: profile.id,
          img: profile._json.image.url,
          team: 'null',
          programs: ['NULL'],
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
    res.redirect('/');
  }
);

app.get('/templates', (req, res) => {
  res.redirect('/home');
});

app.get('/authenticate', (req, res) => {
  // renders authenticate.ejs
  res.render('authenticate.ejs');
});

app.get('/logout', (req, res) => {
  req.session.cookieKey = null;
  req.session.user = null;
  req.logout();
  res.redirect('/authenticate');
});

app.get('/', (req, res) => {
  res.redirect('/home');
});

/**
 * Retrieve templates from Salesforce
 */
var conn = new jsforce.Connection({
  oauth2: {
    // update at config/keys
    loginUrl: 'https://ixl.my.salesforce.com',
    clientId: keys.salesforce.clientId,
    clientSecret: keys.salesforce.clientSecret
  }
});
/**
 * Structure of the conn.login function:
 * 1. Log token and instanceURL to the console
 * 2. Query IXL Template templates
 * 3. Query Quia Web templates
 * 4. Query Quia Books templates
 * 5. Query Family templates
 *
 * Each query will loop through each returned record to collect, format,
 * to create or update an existing one using MongoDb update function.
 * @param  {[type]} err      [description]
 * @param  {[type]} userInfo [description]
 * @return {[type]}          [description]
 */
conn.login(keys.salesforce.username, keys.salesforce.password, function(err, userInfo) {
  if (err) {
    return console.error(err);
  }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.

  conn.sobject("EmailTemplate") // Start of query for IXL
    .select('Id, Name, HtmlValue, LastModifiedDate, IsActive, DeveloperName, Folder.Name')
    .where(
      tsixl +
      tsixlreports +
      tsixlsignin +
      tsixlskill +
      tsixltemp +
      tsl1ixl +
      tsixldeletion +
      end)
    .execute(function(err, records) {
      try {
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          if (record.HtmlValue != null && record.IsActive == true) {
            var folder = record.Folder.Name;

            /* Format the date and body of the e-mail */
            var longDate = new Date(record.LastModifiedDate);
            var date = MONTH_NAMES[longDate.getMonth()] + ' ' + longDate.getDate() + ', ' + longDate.getFullYear();
            var numberRegex = /\d*\.*\d*\s*(.*)/g;
            var name = numberRegex.exec(record.Name)[1];
            var body = record.HtmlValue;
            body = body.replace(/(\r\n|\n|\r)/gm, "");
            replyEmail = body.match(/([a-zA-Z0-9._-]+@ixl.com+)/gi)[0];
            var numberRegex = /(\d*\.*\d*\s*)(.*)/g;
            var numberSplit = numberRegex.exec(record.Name);
            var name = numberSplit[2];
            var scNum = numberSplit[1];
            body = body.toString();
            var result = clean(body, 'IXL');
            templatesDb.collection('templates')
              .update({
                id: record.DeveloperName
              }, {
                $set: {
                  body: result[1].toString(),
                  updatedDate: date,
                  addedByUser: 'salesforce@salesforce.com',
                  team: 'techSupport',
                  program: 'IXL',
                  replyEmail: 'help@ixl.com',
                  folder: folder,
                }
              }, {
                upsert: true
              }) // End of update statement
          } // End of if statement
        } // End of for loop
      } catch (e) {
        console.log(e);
      }
    }) // End of query for IXL


  conn.sobject("EmailTemplate") // Start of query for QW
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
      tsqwdeletion +
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
            var result = clean(body, 'QW');
          }
          if (record.Body != null && record.IsActive == true) {
            templatesDb.collection('templates')
              .update({
                id: record.DeveloperName
              }, {
                $set: {
                  greeting: result[0],
                  body: result[1],
                  closing: result[2],
                  updatedDate: date,
                  addedByUser: 'salesforce@salesforce.com',
                  team: 'techSupport',
                  program: 'QW',
                  replyEmail: replyEmail,
                  folder: folder,
                  name: name
                }
              }, {
                upsert: true
              }) // End of update statement
          } // End of if statement
        } // End of for loop
      } catch (e) {
        console.log(e);
      }
    }) // End of query for QW



  conn.sobject("EmailTemplate") // Start of query for Quia Books (L1 Only)
    .select('Id, Name, Body, LastModifiedDate, IsActive, DeveloperName, Folder.Name')
    .where(
      // L1 QB folders
      tsl1ak +
      tsl1hlc +
      tsl1qb +
      tsl1ct +
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

            var numberRegex = /(\d*\.*\d*\s*)(.*)/g;
            var numberSplit = numberRegex.exec(record.Name);
            var name = numberSplit[2];
            var scNum = numberSplit[1];
            body = body.toString();

            var result = clean(body, 'QB');
          }
          // fields in Account relationship are fetched
          if (record.Body != null && record.IsActive == true) {

            templatesDb.collection('templates')
              .update({
                id: record.DeveloperName
              }, {
                $set: {
                  body: result[1].toString(),
                  greeting: result[0].toString(),
                  closing: result[2].toString(),
                  updatedDate: date,
                  addedByUser: 'salesforce@salesforce.com',
                  team: 'techSupport',
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
    }) // End of query for QB



  conn.sobject("EmailTemplate") // Start of query for Quia Books (L2 Only)
    .select('Id, Name, Body, LastModifiedDate, IsActive, DeveloperName, Folder.Name')
    .where(
      // L2 QB folders
      tsqb +
      tsct +
      tsheinle +
      tsqbstolen +
      tsqbdeletion +
      tsalkitaab +
      tsestudio +
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

            var numberRegex = /(\d*\.*\d*\s*)(.*)/g;
            var numberSplit = numberRegex.exec(record.Name);
            var name = numberSplit[2];
            var scNum = numberSplit[1];
            body = body.toString();

            var result = clean(body, 'QB');
          }
          // fields in Account relationship are fetched
          if (record.Body != null && record.IsActive == true) {
            var fs = require('fs');
            //fs.writeFile("./backup/templates.txt", record.DeveloperName);
            //console.log(record.DeveloperName + "***" + result[1].toString());
            templatesDb.collection('templates')
              .update({
                id: record.DeveloperName
              }, {
                $set: {
                  body: result[1].toString(),
                  greeting: result[0].toString(),
                  closing: result[2].toString(),
                  updatedDate: date,
                  addedByUser: 'salesforce@salesforce.com',
                  team: 'techSupport',
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
    }) // End of query for QB

  // Start query for groups (Salesforce queues)

  // need to loop through to include each GroupId for the queues I want.


  var groupIds = ['00G33000002JitjEAC', '00G0b000002JnHtEAK'];

  for (var l = 0; l < groupIds.length; l++) {
    conn.sobject("Group").select("*").where("Id =" + "\'" + groupIds[l] + "\'").execute(function(err, groupRecords) {
      for (var m = 0; m < groupRecords.length; m++) {
        queues.push({
          "name": groupRecords[m].Name,
          "program": "IXL",
          "id": groupRecords[m].Id,
          "users": []
        });

      }
    })
    var groupIdQuery = 'GroupId = ' + '\'' + groupIds[l] + '\'';
    for (var i = 0; i < groupIds.length; i++) {
      conn.sobject("GroupMember").select("*").where(groupIdQuery).execute(function(err, records) {
        try {


          for (var j = 0; j < records.length; j++) {
            var idQuery = 'Id = ' + "\'" + records[j].UserOrGroupId + "\'";
            conn.sobject("User").select("Name").where(idQuery).execute(function(error, userRecords) {
              for (var k = 0; k < userRecords.length; k++) {
                console.log(userRecords[k].Name);
                queues[l].users.push(userRecords[k].Name);
              }
            });
          }
        } catch (e) {
          console.log(e);
        }
      })
    }
  }


}); // End of  conn.login

function clean(body, id) {
  try {
    body = body.replace(/(\r\n|\n|\r)/gm, "");
    var result = body.split(/\s*<\s*\/?br\s*\/?>\s*<\s*\/?br\s*\/?>\s*/g).slice();
    var greeting = 'none';
    var foundGreeting = false;
    for (var j = 0; j < result.length; j++) {
      // If it contains !Contact then remove it

      if (result[j].match(/Dear/) || result[j].match(/Hello/) || result[j].match(/Hi\s/) || result[j].match(/Hi{/)) {
        result.splice(j, 1);
      }
      // If it contains Thank you and number of sentences is 1, set it as intro
      if (result[j].match(/Thank\syou/) && foundGreeting == false && j == 0) {
        var foundGreeting = true;
        var num = (result[j].match(/\./g) || []).length;
        if (num == 1) {
          greeting = result[j];
          result.splice(j, 1);
        } else if (foundGreeting == false && j == 0) {
          var foundGreeting = true;
          greeting = result[j];
        }
      }

      // If the result contains incerely, splice
      if (result[j].match(/\{!Case\.OwnerFirstName/)) {
        result.splice(j);
      }
    }
    if (foundGreeting == false) {
      greeting = 'none';
    }
    var closing = result.pop();
    finalBody = [];

    for (var k = 0; k < result.length; k++) {
      if (k == result.length - 1) {
        finalBody.push(result[k]);
        continue;
      }
      finalBody.push(result[k] + `<br/><br/>`);
    }

    return [greeting, finalBody.join(""), closing];
  } catch (e) {
    console.log(e);
  }
}

function cleanTest(body) {
  try {
    var greeting = 'none';
    if (body.match(/\*.*\*/)) {
      var warningMsgRegex = /\*.*\*<\/br><\/br>/;
      var warningMsg = warningMsgRegex.exec(body);
      greeting = warningMsg;
      body = body.replace(warningMsg, '');
    }

    if (body.match(/Hi NAME,\s*<\/br><\/br>/gm)) {
      var firstLineRegex = /Hi NAME,\s*<\/br><\/br>/gm;
      var firstLine = firstLineRegex.exec(body)[0];
      body = body.replace(firstLine, '');
    }

    return [greeting, body, 'none'];

  } catch (e) {
    console.log(e);
  }
}