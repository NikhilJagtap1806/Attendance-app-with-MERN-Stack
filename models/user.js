// user.js
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/hashPassword'); // Adjust the path accordingly

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String
});

userSchema.pre('save', function (next) {
    if (this.isModified('password') || this.isNew) {
        this.password = hashPassword(this.password);
    }
    next();
});

const User = mongoose.model('User_data', userSchema);

module.exports = {
  User
};
