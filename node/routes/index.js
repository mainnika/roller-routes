// Libs:

var user = require('../api/user');

// Public:

exports.main = function(req, res){
	var dataset = {};
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		localRender();
	});
	
	function localRender(){
		res.render('index', { title: 'Главная страница', data: dataset });
	}
};