// Libs:

var user = require('../api/user');
var h = require('../api/hash');
var db = (new (require('../api/sql').sql)).getConnection();

// Public:

exports.userActionPublicToggle = function(req,res){
	var dataset = {};
	var id = parseInt(req.body.id,10);
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		checkStatements();
	});
	
	function checkStatements(){
		if ((!dataset.user.login)||(isNaN(id))){
			localError();
		}else{
			checkOwner();
		}
	}
	
	function checkOwner(){
		db.query('SELECT `owner` FROM `routes` WHERE `id`=?',[id],function(e,res){
			if (e){
				throw new Error(e);
				localError();
			}else{
				if (res[0].owner == dataset.user.id){
					makePublic();
				}else{
					localError();
				}
			}
		})
	}
	
	function makePublic(){
		db.query('UPDATE `routes` SET `public`=(`public`+1)%2 WHERE `id`=?',[id],function(e,res){
			if (e){
				throw new Error(e);
				localError();
			}else{
				localRender();
			}
		})
	}
	
	function localRender(){
		res.redirect('/user/profile');
	}
	
	function localError(){
		res.redirect('/user/profile');
	}
}

exports.userActionLike = function(req,res){
	var dataset = {};
	var id = parseInt(req.body.id,10);
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		checkStatements();
	});
	
	function checkStatements(){
		if ((!dataset.user.login)||(isNaN(id))){
			localError();
		}else{
			like();
		}
	}
	
	function like(){
		var unik = h.md5(dataset.user.id + ' ' + id);
		db.query('INSERT INTO `likes` (`owner`,`route`,`unik`) VALUES (?,?,?) ON DUPLICATE KEY UPDATE `route`=`route`*(-1)',[dataset.user.id,id,unik],function(e,res){
			if (e){
				throw new Error(e);
				localError();
			}else{
				localRender();
			}
		});
	}
	
	function localRender(){
		res.redirect('/routes/top');
	}
	
	function localError(){
		res.redirect('/');
	}
}
