const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true,'Password Requied']
    },
    post:
    {
        type: Schema.Types.ObjectId,
        ref: 'Posts'
    },
    address: String,
    phoneNumber: String,
    description: String
})

const Users = mongoose.model('Users', userSchema);
module.exports = Users;