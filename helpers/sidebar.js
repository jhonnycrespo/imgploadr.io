var Stats = require('./stats');
var Images = require('./images');
var Comments = require('./comments');
var async = require('async');

module.exports = function(viewModel, callback){
	async.parallel(
    [
      function(next) {
        Stats(next);
      },
      function(next) {
        Images.popular(next);
      },
      function(next) {
        Comments.newest(next);
      }
    ], 

    function(err, results){      
      if(err) throw err;

      viewModel.sidebar = {
        stats: results[0],
        popular: results[1],
        comments: results[2]
      };

    callback(viewModel);
  });
};