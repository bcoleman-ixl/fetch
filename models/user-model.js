const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//  Model for adding a new user
const userSchema = new Schema({
  name: String,
  googleID: String,
  img: String,
  team: String,
  type: String,
  email: String
})

const User = mongoose.model('users', userSchema);

module.exports = User;
