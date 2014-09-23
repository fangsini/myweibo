var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var User = require('../models/user');
var Post = require('../models/post');

/* GET home page. 主页*/
router.get('/', function(req, res) {
	var name;
	if(req.session.user){
		var currentUser = req.session.user;	
		name = currentUser.name;
	}else{
		name = null;
	}
	Post.get(null,function(err,posts){
			res.render('index', { 
			  	title: '主页',
			  	posts:posts, 
			  	name:name,
			});
		});
});

//注册
router.get('/reg',function(req,res){
	res.render('reg',{title:'注册'});
});
router.post('/reg',function(req,res){
	var username = req.body.username;
	var psw = req.body.password;
	var comfirm_psw = req.body.comfirm_psw;
	//判断不能为空
	if(username == ""||psw==""||comfirm_psw==""){
		req.flash("error","信息不能为空");
		console.log("res.locals.error:"+res.locals.error);
		return res.redirect('/reg');
	}
	console.log("res.locals.error:"+res.locals.error);
	if(psw!=comfirm_psw){
		req.flash('error','两次输入的密码不一样');
		return res.redirect('/reg');
	}
	var md5 = crypto.createHash('md5'),
		password = md5.update(psw).digest('base64');
	var newUser = new User({
		name:username,
		password:password,
	});
	//检测用户名是否存在
	User.get(newUser.name,function(err,user){
		if(user){
			err = "Username already exists."
		}
		if(err){
			req.flash("error",err);
			return res.redirect('/reg');
		}

		//如果用户不存在保存进数据库
		newUser.save(function(err){
			if(err){
				req.flash("error",err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash("success","注册成功");
			res.redirect("/");
		});
	});
});

//登录
router.get('/login',function(req,res){
	res.render('login',{title:'登录'});
});	
router.post('/login',function(req,res){
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username,function(err,user){
		if(!user){
			req.flash('error','用户不存在');
			console.log("ok");
			return res.redirect('/login');
		}
		if(user.password!=password){
			req.flash('error','密码错误');
			console.log("ok1");
			return res.redirect('/login');
		}
		req.session.user = user;
		console.log("user._id:"+user.name);
		req.flash('success','登录成功');
		console.log("ok2");
		return res.redirect('/');
	});
});

//发表
// router.get('/post',function(req,res){
// 	res.render('post',{title:'发表'});
// });
router.post('/post',checkNotLogin);
router.post('/post',function(req,res){
	var currentUser = req.session.user;
	var post = req.body.post;
	// if(post == ""){
	// 	res.flash("error","微博不能为空");
	// 	// return res.redirect("");
	// }
	var post = new Post(currentUser.name,post,currentUser.name);
	
	post.save(function(err,post){
		if(err){
			console.log(err);
			return res.redirect('/');
		}
		req.flash("success","发表成功");
		res.redirect('/u/' + currentUser.name);
	});
});

//我的微博
router.get('/mypost',function(req,res){
	var currentUser = req.session.user;
	Post.get(currentUser.name,function(err,posts){
		res.render("mypost",{
			"posts":posts,
			"name":currentUser.name,
		});
	});
});

//发表微博后的用户界面
router.get('/u/:user',function(req,res){
	var currentUser = req.session.user;
	User.get(req.params.user,function(err,user){
		if(!user){
			req.flash("error","用户不存在");
			return res.redirect("/");
		}
		Post.get(user.name,function(err,posts){
			if(!posts){
				req.flash("error",err);
				return res.redirect("/");
			}
			res.render("user",{
				"username":user.name,
				"posts":posts,
				"name":currentUser.name,
			});
		});
	});
});

//删除微博
router.get("/delete/:time",function(req,res){
	Post.del(req.params.time,function(err){
		if(err){
			req.flash("error",err);
		}
		return res.redirect("/");
	});
});

//回复微博
router.post('/reply/:oldName',function(req,res){
	var oldName = req.params.oldName;
	console.log("oldName:"+oldName);
	var reply_post = req.body.reply_post;
	var currentUser = req.session.user;
	var post = new Post(currentUser.name,reply_post,oldName);
	console.log("currentUser.name:"+currentUser.name);
	post.save(function(err,post){
		if(!post){
			req.flash("error",err);
			return res.redirect("/");
		}
		return res.redirect("/");
	});
});

//退出
router.get('/logout',function(req,res){
	req.session.user = null;
	res.redirect('/');
});

module.exports = router;

//检查是否登录函数
function checkNotLogin(req,res,next){
	if(!req.session.user){
		req.flash("err","请用户先登录");
		return res.redirect("/login");
	}
	next();
}





