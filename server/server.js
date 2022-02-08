'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

var http = require('http');
var server = http.createServer(app);
var connections = [];
var users = [];
var io = require('socket.io').listen(server);
io.set("origins", "*:*");




app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};
//
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
    //app.start();
    {
        app.io = require('socket.io')(app.start());
        app.io.on('connection', function(socket) {
            socket.on('create notification', function(data, type, name) {
                app.io.emit('new notification', data, type, name);
            });
            socket.on('disconnect', function() {});
        });
    }
});
const cron = require('node-cron');

const User = app.models.pylk_account;
const Inf = app.models.inf_register;
const Contr = app.models.contract;
const Br = app.models.brand_register;
const agc = app.models.agence_register;
const comp = app.models.compayn;
const room = app.models.room;


const msg = app.models.messages;
const notif = app.models.notification;


// you must send box notification (5min for test) every day


// ***** end (15min for test) every day script for box sending notification

//socket section
server.listen(8000);



io.on('connection', function(socket) {
    connections.push(socket)
    console.log(connections.length, " connected");
    //disconnect
    socket.on('create notification', function(data) {
            connections.splice(connections.indexOf(socket), 1)
            console.log("disconnected: %s sockets connected", connections.length);
        })
        //notification
    socket.on('create notification', function(data) {
        notif.create({ title: data.msg, user_id: data.id_receiver, user_off: data.user_id, action: data.action, message: data.message })
        socket.broadcast.emit('new notification', data);
    });
    //chat
    socket.on('create message', function(data, type) {
        socket.broadcast.emit('new message', data, type);
    });
    //New user
    socket.on('new_user,function', function(data, callback) {
        callback(true)
        socket.username = data
        users.push(socket.username)
        updateUsernames()
    })

    function updateUsernames() {
        io.sockets.emit('get users', usernames)
    }
});