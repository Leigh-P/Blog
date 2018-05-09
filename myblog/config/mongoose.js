var mongoose = require('mongoose');
var config = require('./config');
module.exports = function () {
    var db = mongoose.connect(config.mongodb);
    require('./../models/user.model');
    require('./../models/post/server.model')
}