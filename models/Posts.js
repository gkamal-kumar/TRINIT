const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    message: {
        type:String
    },
    user: [{
        details: {
            type: Schema.Types.ObjectId,
            ref: 'Users'
        },
        moneypaid: String
    }
    ]
})

const Posts = mongoose.model('Posts', postSchema);
module.exports = Posts;