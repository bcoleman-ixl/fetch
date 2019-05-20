var MongoClient = require('mongodb').MongoClient;

var _db;
module.exports = {
  connectToServer: function(callback) {
    MongoClient.connect("mongodb://fetchAdmin:fetchAdmin1500@127.0.0.1:27017/fetch", function(err, client) {
      _db = client.db('fetch');
      return callback(err);
    });
  },

  getDb: function() {
    return _db;
  }
};