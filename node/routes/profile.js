// Libs:

var user = require('../api/user');
var db = (new (require('../api/sql').sql)).getConnection();

// Public

exports.userProfile = function(req, res){
	var dataset = {};
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		checkStatements();
	});
	
	function checkStatements(){
		if (!dataset.user.login){
			localError();
		}else{
			collectRoutes();
		}
	}
	
	function collectRoutes(){
		db.query('SELECT `name`,`desc`,`pre`,`dist`,`id`,`public` FROM `routes` WHERE `owner`=?',[dataset.user.id],function(e,result){
			if (e){
				throw new Error(e);
				localError();
			}else{
				dataset.routes = result;
				localRender();
			}
		});
	}
	
	function localRender(){
		res.render('user_profile', { title: 'Мой профиль', data: dataset });
	}
	
	function localError(){
		res.redirect('/');
	}
	
};