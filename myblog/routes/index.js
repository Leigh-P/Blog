var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('./../models/user.model');
var moment = require('moment');
var formidable = require('formidable');
var markdown = require('markdown-to-html');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = function (app) {
    // 首页
    app.get('/', function (req, res, next) {
        Post.find({}, function (err, data) {
            if (err) {
                // console.log(err);
                req.flash('error', '查找错误');
                return res.redirect('/');
            }
            res.render('index', {
                title: '首页',
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                posts: data,
                time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            });
        });
    })

    // 注册界面
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
        });
    })
    app.post('/reg', function (req, res) {
        var user = new User({
            username: req.body.username,
            password: password,
            email: req.body.email
        });
        if (req.body['password'] != req.body['password-repeat']) {
            console.log('两次输入的密码不一致');
            return res.redirect('/reg');
        }

        User.findOne({ 'username': user.username }, function (err, data) {
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
    // 登录
    app.get('/login', checkNoLogin, function (req, res) {
        res.render('login', {
            title: '登录',
        });
    })
    app.post('/login', function (req, res) {
        var password = req.body.password;
        // 检查用户是否存在
        User.findOne({ 'username': req.body.username }, function (err, user) {
            if (err) {
                console.log('error', '登录出错');
                req.flash('error', '登录出错')
                return res.redirect('/')
            }
            if (!user) {
                console.log('error', '用户不存在')
                req.flash('error', '用户不存在')
                return res.redirect('/login')
            }

            if (user.username != password) {
                console.log('error', '密码错误');
                req.flash('error', '密码错误')
                return res.redirect('/');
            }
            // 用户名和密码都匹配后，将用户信息存入 session
            req.session.user = user;
            console.log(user.username);
            req.flash('success', '登录成功')
            res.redirect('/');
        })
    })
    // 发表文章
    app.get('/post', checkLogin, function (req, res) {
        res.render('post', {
            title: '发表',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    });
    app.post('/post', checkLogin, function (req, res, next) {
        var imgPath = path.dirname(__dirname) + '/public/images';
        var form = new formidable.IncomingForm();   // 创建上传表单
        form.encoding = 'utf-8';
        form.uploadDir = imgPath;
        form.keepExtensions = true;
        form.maxFieldsSize = 2 * 1024 * 1024;
        form.type = true;
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err);
                req.flash('error', '图片上传失败');
                return
            }
            var file = files.postImg;

            if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif' && file.type != 'image/ipg') {
                console.log('上传文件格式错误，只支持 png，jpeg，gif，jpg');
                req.flash('error', '上传文件格式错误，只支持 png， jpeg， gif， jpg');
                return res.redirect('/upload');
            }
            var title = fields.title;
            var author = req.session.user.username;
            var article = fields.article;
            var postImg = file.path.split(path.sep).pop();
            var pv = fields.pv;
            // 校验参数
            try {
                if (!title.length) {
                    throw new Error('请填写标题')
                }
                if (!article.length) {
                    throw new Error('请填写内容');
                }
            } catch (e) {
                req.flash('error', e.message);
                return res.redirect('back');
            }
            var post = new post({
                title: title,
                author: author,
                article: article,
                postImg: postImg,
                publishTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss').toString(),
                pv: pv
            });
            post.save(function (err) {
                if (err) {
                    console.log('文章发表出现错误');
                    req.flash('err', '文章发表出现错误');
                    return res.redirect('/post');
                }
                console.log('文章录入成功');
                req.flash('success', '文章录入成功');
                res.redirect('/');
            })
        })
    })

    // 展示文章
    app.get('detail',function (req, res, next) {
        var id = req.query.id;
        if (id && id !='') {
            Post.update({"_id":id},{$inc:{"pv":1}},function(err){
                if (err) {
                    console.log(err);
                    return res.redirect("back");
                }
                console.log("浏览数量+1");
            });

            Post.findById(id, function(err, data) {
                if (err) {
                    console.log(err);
                    req.flash('error', '查看文章详细信息出错');
                    return res.redirect('/');
                }
                res.render('detail', {
                    title:'文章展示',
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    post:data,
                    img:path.dirname(__dirname) + '/pulic/images' + data.postImg
                })
            })
        }
    })

    // 编辑文章
    app.get('/edit/:author/:title',checkLogin,function(req, res) {
        var id = req.query.id;
        Post.findById(id, function (err, data) {
            // console.log(data);
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑',
                post:data,
                user:req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    app.post('/edit/:author/:title', checkLogin, function(req, res, next) {
        var post = {
            id: req.body.id,
            author: req.session.user,
            title: req.body.title,
            article: req.body.article
        };
        
        console.log(post);

        // markdown 转格式文章
        post.article = markdown.toHTML(post.article);

        Post.update({"_id": post.id},{$set: {title: post.title, article: post.article}}, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("更新成功");
            res.redirect('/');
        })

    })

    // 删除文件
    app.get('/delete',checkLogin, function(req, res) {
        var id = req.query.id;
        console.log(id);
        if (id && id != '') {
            Post.findByIdAndRemove (id, function (err) {
                if (err) {
                    console.log(err);
                    req.flash('success','删除文章失败');
                    return req.redirect('/')
                }
                req.flash('success','删除文章成功');
                res.redirect('/');
            })
        }
    })

    // 退出登录
    app.get('/logout', checkLogin, function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');  // 登出成功后跳转到主页
    })
}
