// Libs:

var user = require('../api/user');

// Public:

exports.notFoundError = function(req, res){
	var dataset = {};
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		localRender();
	});
	function localRender(){
		res.render('404', { title: 'Что-то не найдено', data: dataset, status: 404});
	}
};