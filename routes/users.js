var express = require('express');
var router = express.Router();
//加上传文件
var multiparty = require('multiparty');
var util = require('util');
var format = require('util').format;


/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

//post
router.get('/post',function(req,res){
	res.send('<form method="post" enctype="multipart/form-data">'
		+'<p>Title:<input type="text" name="title" /></p>'
		+'<p>Image:<input type="file" name="image" /></p>'
		+'<p><input type="submit" value="upload" /></p>'
		+'</form>');
});
router.post('/post',function(req,res,next){
	var form = new multiparty.Form();
	var image;
	var title;

	form.on('error',next);
	form.on('close',function(){
		res.send(format('\nuploaded %s (%d Kb) as %s'
			,image.filename
			,image.size / 1024 |0
			,title));
	});
	form.on('field',function(name,val){
		if(name!='title')return;
		title = val;
	});
	form.on('part',function(part){
		if(!part.filename) return;
		if(part.name!=='image') return part.resume();
		image = {};
		image.filename = part.filename;
		image.size = 0;
		part.on('data',function(buf){
			image.size+=buf.length;
		});
	});
	// form.parse(req);
	form.parse(req, function(err, fields, files) {
      	res.writeHead(200, {'content-type': 'text/plain'});
      	console.log(fields);
      	res.write(fields+" "+files+'received upload:\n\n');
      	res.end(util.inspect(files));
    });
});

module.exports = router;
