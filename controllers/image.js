var fs = require('fs');
var path = require('path');
var sidebar = require('../helpers/sidebar');
var Models = require('../models');

module.exports = {

	index: function(req, res){

		var viewModel = {
      image: {},
      comments: []
    };

    Models.Image.findOne({ filename: { $regex: req.params.image_id }}, function(err, image) {
      if(err) throw err;
      
      if(image) {
        image.views = image.views + 1;
        viewModel.image = image;
        image.save();

        Models.Comment.find({ image_id: image._id }, {}, { sort: {'timestamp': 1}}, function(err, comments) {
          if(err) throw err;
          viewModel.comments = comments;

          sidebar(viewModel, function(viewModel){
            res.render('image', viewModel);
          });
        });
      } else {
        res.redirect('/');
      }
    });		
	},

	create: function(req, res){
    console.log(req.file);
    var saveImage = function() {
      var possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
      var imgUrl = '';

      for(var i=0; i< 6; i+=1) {
        imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      Models.Image.find({ filename: imgUrl }, function(err, images) {

        if (images.length > 0) {
          saveImage();
        } else {
          var tempPath = req.file.path;
          var ext = path.extname(req.file.originalname).toLowerCase();
          var targetPath = path.resolve('./public/upload/' + imgUrl + ext);

          if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
            fs.rename(tempPath, targetPath, function(err) {
              if (err) { throw err; }

              var newImg = new Models.Image({
                title: req.body.title,
                filename: imgUrl + ext,
                description: req.body.description
              });

              newImg.save(function(err, image) {
                res.redirect('/images/' + image.uniqueId);
              });
            });

          } else {
            fs.unlink(tempPath, function () {
              if (err) { throw err; }
              res.json(500, {error: 'Only image files are allowed.'});
            });
          }
        }
      });
    };
    
    saveImage();
	},

	like: function(req, res){
		res.json({likes: 1});
	},
	comment: function(req, res){
		res.send('the image: comment POST controller');
	}
}