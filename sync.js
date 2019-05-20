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