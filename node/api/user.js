// Libs:

var http = require('https');
var db = (new (require('./sql').sql)).getConnection();

// Statements:

var anon = {name:'Anonymous',id:0,login:false};

// Private:

function isToken(token){
	return ((/^[a-z0-9]*$/.test(token))&&(token!=undefined)&&(token!=''));
}

// Public:

exports.getData = function(auth, callback){
	if (!isToken(auth)){
		callback(anon);
	}else{
		db.query('SELECT `user_id`,`name` FROM `users` WHERE `auth`=? LIMIT 1',[auth],function(e, res){
			if (e){
				throw new Error(e);
				callback(anon);
			}else{
				callback( (res.length>0) ? {name:res[0].name,id:res[0].user_id,login:true} : anon );
			}
		});
	}
};