const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  googleID: String,
  img: String,
  team: String,
  type: String,
  email: String
})

const User = mongoose.model('user', userSchema);

module.exports = User;
