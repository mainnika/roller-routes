// MySQL Singleton
var db = require('mysql');

exports.sql = new function(){
	var instance;
	var mysql;
	function __construct(){
		if (!instance){
			mysql = db.createClient({
				user: 'roller',
				host: 'localhost',
				database: 'roller'
			})
			instance = this;
		}else{
			return instance;
		}
	}
	__construct.prototype.getConnection = function(){
		return mysql;
	}
	return __construct;
};