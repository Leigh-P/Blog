var mongoose = require('mongoose');
var config = require('./../config/config');
mongoose.connect(config.mongodb);

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String
})

// 数据库创建 users 集合
var User = mongoose.model('User', UserSchema);
module.exports = User;