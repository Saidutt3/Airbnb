const mongoose = require('mongoose');
const passport = require('passport');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    }
});

userSchema.plugin(passportLocalMongoose); // Automatically implements hashing, salting, username for us

module.exports = mongoose.model("User", userSchema);
