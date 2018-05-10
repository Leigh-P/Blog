var stringify =  require('query-string');
var mongoose = require('mongoose');
var config = require('./../config/config');
mongoose.connect(config.mongodb);
var UserSchema = new mongoose.Schema({
    title: String,
    author: String,
    article: String,
    publishTime: String,
    postImg: String,
    comments:[{
        name:String,
        time: String,
        content:String
    }],
    pv: Number
});

var Post = mongoose.model('Post', UserSchema);
module.exports = Post;