const mongoose = require("mongoose");


var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    roles:{
        type: String,
        default:'user'
    }
}
);

module.exports = mongoose.model("User", userSchema);