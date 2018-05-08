var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('./../models/user.model');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = function(app) {
	// 首页
    app.get('/', function(req, res) {
        res.render('index', {
            title: '首页',
        });
    })
    // 注册界面
    app.get('/reg', function (req, res, next) {
    	res.render('reg', {
    		title: '注册',
        }); 
    })
    // 登录
    app.get('/login', function (req, res) {
    	res.render('login', {
    		title: '登录',
    	});
    })
    // 发表文章
    app.get('/post', function (req, res) {
    	res.render ('post', {
    		title: '发表文章',
    	})
    })
}


app.get('reg', function (req, res) {
    res.render('req', {
        title: '注册'
    });
});

app.post('/req', function (req, res) {
    var user = new User({
        username: req.body.username,
        password:password,
        email:req.body.email
    });
    if(req.body['password'] != req.body['password-repeat']) {
        console.log('两次输入的密码不一致');
        return res.redirect('/reg');
    }

    User.findOne({'username':user.username}, function (err, data) {
        if (err) {
            req.flash("err", err);
            return res.redirect('/');
        }
        if (data != null) {
            console.log('该用户已存在');
            return res.redirect('/reg')
        } else {
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect('/');
                }
                console.log('注册用户成功');
                res.redirect('/');
            })
        }
    })
})