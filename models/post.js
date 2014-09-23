var mongodb = require("./db");

function Post(username,post,oldname,time){
	this.user = username;
	this.post = post;
	this.reply = oldname;
	if(time){
		this.time = time;
	}else{
		this.time = (new Date()).Format("yyyy-MM-dd hh:mm:ss");
	}
}
module.exports = Post;

Post.prototype.save = function save(callback){
	var post = {
		user:this.user,
		post:this.post,
		reply:this.reply,
		time:this.time,
	}
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}

		db.collection("posts",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			//添加索引
			collection.ensureIndex("time",{unique:true},function(err){
				callback(err);
			});
			//写入post文档
			collection.insert(post,{safe:true},function(err,post){
				mongodb.close();
				callback(err,post);
			});
		});
	});
}

Post.get = function get(username,callback){
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection("posts",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if(username){
				query.user = username;
			}
			collection.find(query).sort({time:-1}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					callback(err);
				}
				//封装posts为Post对象
				var posts = [];
				docs.forEach(function(doc,index){
					var post = new Post(doc.user,doc.post,doc.reply,doc.time);
					// posts.push(doc.user+" "+doc.post+" "+doc.time+"//nx");
					posts.push(post);
				});
				callback(null,posts);
			});
		});
	});
}

Post.del = function del(time,callback){
	// mongodb.open(function(err,db){
	// 	if(err){
	// 		mongodb.close();
	// 		return callback(err);
	// 	}
	// 	db.collection("posts",function(err,collection){
	// 		if(err){
	// 			mongodb.close();
	// 			return callback(err);
	// 		}
	// 		collection.find("_id",postId,function(err,post){
	// 			if(err){
	// 				mongodb.close();
	// 				return callback(err);
	// 			}
	// 			post.remove(function(err){
	// 				mongodb.close();
	// 				if(err){
	// 					return callback(err);
	// 				}
	// 			});
	// 		});
	// 	});
	// });
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection("posts",function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.remove({"time":time},function(err){
				console.log("fuck you");
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
}

//日期格式化
Date.prototype.Format = function(fmt)   
{ //author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}  





