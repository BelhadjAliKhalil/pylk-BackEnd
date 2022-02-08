'use strict';
const needle = require('needle');
const stripe = require("stripe")("sk_test_XeDPiHJAHgK60Nq4wNtEcaVU");
module.exports = function(notif) {

    // ********************* delete old notifications **********************
    notif.remoteMethod(
        'new_messages_seen', {
            accepts: [
                { arg: 'obj', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    notif.new_messages_seen = function(obj, cb) {
            notif.find({
                where: {
                    "and": [{ user_id: { "regexp": `^${obj.user_id}/i` } },
                        { message: true }
                    ]
                }
            }, function(err, notif_inst) {
                var options = {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
                let data = {}
                for (let index = 0; index < notif_inst.length; index++) {
                    notif_inst[index].seen = true
                    notif_inst[index].save()
                    needle.delete('http://localhost:3000/api/notifications/' + notif_inst[index].notif_id, data, options, function(err2, res) {
                        if (err2) {
                            return cb(err2)
                        }
                    })
                }
                if (!err) {
                    return cb(err, "done")
                }
            })
        }
        // ********************* end delete old notifications **********************
        // ********************* return new messages ********************
    notif.remoteMethod(
        'get_new_messages', {
            accepts: [
                { arg: 'user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    notif.get_new_messages = function(user, cb) {
            notif.find(function(err, notif_inst) {
                let res = []
                for (let index = 0; index < notif_inst.length; index++) {
                    if (notif_inst[index].user_id == user.id && notif_inst[index].seen == false && notif_inst[index].message == true) {
                        res.push(notif_inst[index])
                    }
                }
                if (res[0]) {
                    return cb(err, res)
                } else {
                    return cb(err, "no notifications found")
                }
            })
        }
        // *********************end return new messages ********************
        // ********************* return new notifications ********************
    notif.remoteMethod(
        'get_notifications', {
            accepts: [
                { arg: 'user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    notif.get_notifications = function(user, cb) {
            notif.find(function(err, notif_inst) {
                let res = []
                for (let index = 0; index < notif_inst.length; index++) {
                    if (notif_inst[index].user_id == user.id && notif_inst[index].seen == false) {
                        res.push(notif_inst[index])
                    }
                }
                if (res[0]) {
                    return cb(err, res)
                } else {
                    return cb(err, "no notifications found")
                }
            })
        }
        // *********************end return new notifications ********************
        // ********************** hide old notifications ******************
    notif.remoteMethod(
        'notification_seen', {
            accepts: [
                { arg: 'not', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    notif.notification_seen = function(not, cb) {
            notif.findOne({ where: { notif_id: not.notif_id } }, function(err, notif_inst) {
                notif_inst.seen = true
                notif_inst.save()
                return cb(err, notif_inst)
            })
        }
        // **********************end hide old notifications ******************

};