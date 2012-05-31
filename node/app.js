
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  //app.use(express.methodOverride());
  //app.use(express.static('../static/'));
  app.use(app.router);
});

/*
app.error(function(err, req, res, next){
    console.log(err);
    if (err instanceof NotFound) {
        res.render('404', {
            title : 'Not Found',
			layout: false,
            status: 404
        });
    } else {
        res.render('500', {
            title : 'The Server Encountered an Error',
			layout: false,
            error: err,
            status: 500
        });
    }
});

function NotFound(msg) {
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}
*/

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get ('/routes/add',    routes.routes_add);
app.post('/routes/add',    routes.routes_add_post);
app.get ('/routes/latest', routes.routes_latest);
app.get ('/routes/top',    routes.routes_top);
app.get ('/routes/:id',    routes.route_byid);

app.get('/user/login', routes.login);
app.get('/user/logout', routes.logout);
app.get('/user/profile', routes.user_profile);
app.post('/user/action/publictoggle', routes.user_action_publictoggle);
app.post('/user/action/like', routes.user_action_like);

app.get('/changelog', routes.changelog);

app.get('/', routes.index);

// 404
// app.all('*', function(req, res){
    // throw new NotFound('URL: ' + req.url);
// });

app.listen(8081, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
