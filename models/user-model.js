const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  googleID: String,
  profilePicURL: String,
  team: String,
  type: String
})

const User = mongoose.model('user', userSchema);

module.exports = User;