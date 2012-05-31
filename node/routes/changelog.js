// Libs:

var user = require('../api/user');

// Public:

exports.changeLog = function(req, res){
	var dataset = {};
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		localRender();
	});
	
	function localRender(){
		res.render('changelog', { title: 'Последние изменения', data: dataset})
	}
};