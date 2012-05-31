
// MAPPER

// /
exports.index = require('./index.js').main;

// /routes/*
var routes = require('./routes.js');
exports.routes_add_post = routes.routesAdd_Post;
exports.routes_add      = routes.routesAdd_Get;
exports.routes_latest   = routes.routesLatest;
exports.routes_top      = routes.routesTop;
exports.route_byid      = routes.routesById;

// /user/log*/*
var vk = require('./vkauth.js');
exports.login = vk.login;
exports.logout = vk.logout;

// /user/profile/*
exports.user_profile = require('./profile.js').userProfile;

// /user/action/*
var action = require('./action.js');
exports.user_action_publictoggle = action.userActionPublicToggle;
exports.user_action_like = action.userActionLike;

// /changelog/*
exports.changelog = require('./changelog.js').changeLog;

// NOT FOUND ERROR
exports.notfound = require('./404.js').notFoundError;