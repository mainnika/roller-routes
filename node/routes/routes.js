// Libs:

var user = require('../api/user');
var db = (new (require('../api/sql').sql)).getConnection();
var h = require('sanitizer');

// Private:

function calcDist(slat,slng,flat,flng){
	var D2R = 0.017453; // Константа для преобразования градусов в радианы
	var R2D = 57.295781; // Константа для преобразования радиан в градусы
	var a = 6378137.0; // Основные полуоси
	var b = 6356752.314245; // Неосновные полуоси
	var e2 = 0.006739496742337; // Квадрат эксцентричности эллипсоида
	var f = 0.003352810664747;
	var fdLambda = (slng - flng) * D2R;
	var fdPhi = (slat - flat) * D2R;
	var fPhimean = ((slat + flat) / 2.0) * D2R;
	var fTemp = 1 - e2 * (Math.pow(Math.sin(fPhimean), 2));
	var fRho = (a * (1 - e2)) / Math.pow(fTemp, 1.5);
	var fNu = a / (Math.sqrt(1 - e2 * (Math.sin(fPhimean) * Math.sin(fPhimean))));
	var fz = Math.sqrt(Math.pow(Math.sin(fdPhi / 2.0), 2) + Math.cos(flat * D2R) * Math.cos(slat * D2R) * Math.pow(Math.sin(fdLambda / 2.0), 2));
		fz = 2 * Math.asin(fz);
	var fAlpha = Math.cos(flat * D2R) * Math.sin(fdLambda) * 1 / Math.sin(fz);
		fAlpha = Math.asin(fAlpha);
	var fR = (fRho * fNu) / ((fRho * Math.pow(Math.sin(fAlpha), 2)) + (fNu * Math.pow(Math.cos(fAlpha), 2)));
	return (fz * fR);
}

// Public:

exports.routesAdd_Get = function(req, res){
	var dataset = {};
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		localRender();
	});
	
	function localRender(){
		res.render('routes_add', { title: 'Добавить маршрут', data: dataset });
	}
}

exports.routesAdd_Post = function(req, res){
	var dataset = {};
	var jspath;
	
	if ((req.body.path==undefined)||(req.body.desc==undefined)||(req.body.name==undefined)||(req.body.pre==undefined)){
		localError();
	}else{
		validatePath();
	}
	
	function validatePath(){
		jspath = JSON.parse(req.body.path);
		if (jspath instanceof Array){
			if (jspath.length<2){
				localError();
			}else{
				for(var i=0;i<jspath.length;i++){
					var q = jspath[i];
					if (!((typeof q.lat == 'number')&&(typeof q.lng == 'number')&&(typeof q.type == 'number')&&(typeof q.text == 'string'))){
						jspath = null;
						localError();
						break;
					}
				}
				if (jspath)
					userAuth();
			}
		}else{
			localError();
		}
	}
	
	function userAuth(){
		user.getData(req.cookies['auth'],function(userdata){
			dataset.user = userdata;
			addPath();
		});
	}
	
	function addPath(){
		var cline = [];
		var dist = 0;
		for (var i=0;i<jspath.length;i++){
			if (i>0){
				dist+=calcDist(jspath[i-1].lat,jspath[i-1].lng,jspath[i].lat,jspath[i].lng);
			}
			cline.push({lat:jspath[i].lat,lng:jspath[i].lng,type:jspath[i].type,text:jspath[i].text});
		}
		db.query('INSERT INTO `routes` (`owner`,`route`,`dist`,`desc`,`name`,`pre`) VALUES (?,?,?,?,?,?)',[dataset.user.id,JSON.stringify(cline),dist,h.escape(req.body.desc.trim()),h.escape(req.body.name.trim()),req.body.pre.trim().replace(/"/g,'')],function(e,res){
			if (e){
				throw new Error(e);
				localError();
			}else{
				localRender();
			}
		});
	}
	
	function localError(){
		res.redirect('/');
	}
	
	function localRender(){
		res.redirect('/user/profile');
	}
}

exports.routesLatest = function(req,res){
	var dataset = {};
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		collectLast();
	});
	
	function collectLast(){
		db.query('SELECT `routes`.`id` AS `id`,`routes`.`owner`,`dist`,`desc`,`name`,`pre`,`likes`.`unik` AS `unik` FROM `routes` LEFT JOIN `likes` ON `routes`.`id` = `likes`.`route` AND `likes`.`owner`=? WHERE `routes`.`public`=1 ORDER BY `id` DESC',[dataset.user.id],function(e,result){
			if (e){
				throw new Error(e);
				localError();
			}else{
				dataset.routes = result;
				localRender();
			}
		})
	}
	
	function localRender(){
		res.render('routes_last', { title: 'Все маршруты', data: dataset });
	}
	
	function localError(){
		res.redirect('/');
	}
}

exports.routesTop = function(req,res){
	var dataset = {};
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		collectTop();
	});
	
	function collectTop(){
		db.query('SELECT `routes`.`id`,`routes`.`owner`,`routes`.`dist`,`routes`.`desc`,`routes`.`name`,`routes`.`pre`,count(*) AS `rate` FROM `routes`,`likes` WHERE `likes`.`route` = `routes`.`id` AND `routes`.`public`=1 GROUP BY `routes`.`id`,`routes`.`owner`,`routes`.`dist`,`routes`.`desc`,`routes`.`name`,`routes`.`pre` ORDER BY `rate` DESC LIMIT 10',function(e,result){
			if (e){
				throw new Error(e);
				localError();
			}else{
				dataset.routes = result;
				localRender();
			}
		})
	}
	// Render
	function localRender(){
		res.render('routes_top', { title: 'Все маршруты', data: dataset });
	}
	
	function localError(){
		res.redirect('/');
	}
}

exports.routesById = function(req,res){
	var dataset = {};
	var id = parseInt(req.params.id,10);
	
	user.getData(req.cookies['auth'],function(userdata){
		dataset.user = userdata;
		checkStatements();
	});
	
	function checkStatements(){
		if (isNaN(id)){
			localError();
		}else{
			getRoute();
		}
	}
	
	function getRoute(){
		db.query("SELECT `id`,`route`,`owner`,`name`,`desc` FROM `routes` WHERE `id`=? AND (`owner`=? OR `public`=1)",[id,dataset.user.id],function(e,result){
			if (e){
				throw new Error(e);
				localError();
			}else{
				if (result.length>0){
					dataset.route = result[0];
					localRender();
				}else{
					localError()
				}
			}
		})
	}
	
	function localRender(){
		res.render('routes_byid', { title: 'Маршрут #'+id, data: dataset });
	}
	
	function localError(){
		res.redirect('/');
	}
}
