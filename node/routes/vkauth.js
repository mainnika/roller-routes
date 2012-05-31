// Libs:

var http = require('https');
var h = require('../api/hash');
var vk = require('../api/vk');
var db = (new (require('../api/sql').sql)).getConnection();

// Private:

function continueUserLogin(code,callback){
	vk.getAuth(code,function(auth){
		if (auth){
			vk.getProfile(auth.user_id,auth.access_token,function(user){
				userRegister(user.uid,user.first_name+' '+user.last_name,auth.access_token,auth.expires_in);
			})
		}else{
			callback(null);
		}
	})
	
	function userRegister(user_id,name,access_token,expires_in){
		var auth = h.sha256(access_token,user_id.toString());
		var query = db.query('INSERT INTO `users` (`user_id`,`name`,`token`,`expire`,`auth`) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE `auth`=?, `token`=?, `name`=?, `expire`=?',[user_id,name,access_token,expires_in,auth,auth,access_token,name,expires_in],function(e,res){
			if (e){
				throw new Error(e);
				return;
			}
			callback(auth);
		});
	}
}

// Public:

exports.login = function(req,res){
	if (req.param('code')!=undefined){
		continueUserLogin(req.param('code'),function(auth){
			if (auth){
				res.cookie('auth', auth, { expires: new Date(Date.now() + 604800000 /* One week */), httpOnly:true, path:'/' });
				res.redirect('/user/login?success');
			}else{
				res.redirect('/user/login?fail');
			}
		});
	}else if (req.param('success')!=undefined){
		res.render('vkauth', { title: 'Auth success', layout: false, status: 'ok' })
	}else{
		res.render('vkauth', { title: 'Something wrong', layout: false, status: 'false' })
	}
}

exports.logout = function(req,res){
	res.cookie('auth',undefined,{ expires: new Date(Date.now() + 604800000 /* One week */), httpOnly:true, path:'/' });
	res.redirect('/');
}