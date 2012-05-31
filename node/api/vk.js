var http = require('https');

function isToken(token){
	return ((/^[a-z0-9]*$/.test(token))&&(token!=undefined)&&(token!=''));
}

exports.getAuth = function(code,callback){

	if (!isToken(code)){
		callback(null);
		return;
	}
	
	var req = http.get({host:'oauth.vk.com',port:443,path:'/access_token?client_id=2955334&client_secret=asdasd&code='+code},function(res){

		if (res.statusCode!=200){
			callback(null);
			return;
		}
		
		res.setEncoding('utf8');
		res.on('data',function(data){
			
			var auth = JSON.parse(data);
			
			if (auth.access_token!=undefined){
				callback(auth);
				return;
			}else{
				callback(null);
				return;
			}

		});
	
	})
	
	req.on('error',function(e){
		callback(null);
		return;
	})

}

exports.getProfile = function(uid,token,callback){
	
	if (!isToken(token)){
		callback(null);
		return;
	}

	var req = http.get({host:'api.vk.com',port:443,path:'/method/getProfiles?uids='+uid+'&fields=uid,first_name,last_name&access_token='+token},function(res){
		
		if (res.statusCode!=200){
			callback(null);
			return;
		}
		
		res.setEncoding('utf8');
	
		res.on('data',function(data){
			var user = JSON.parse(data);
			callback(user.response[0]);
		});		
		
	})
	
	req.on('error',function(e){
		callback(null);
		return;
	})

}
