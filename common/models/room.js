'use strict';

module.exports = function(Room) {
    var app = require('../../server/server')
    const moment = require('moment')
    const cron = require('node-cron');
    const User = app.models.pylk_account;
    const Inf = app.models.inf_register;
    const Contr = app.models.contract;
    const agc = app.models.agence_register;
    const comp = app.models.compayn;
    const msg = app.models.messages;
    const notif = app.models.notification;
    const needle = require('needle');
    const Br = app.models.brand_register;
    const Stats = app.models.statistiques;
    const stripe = require("stripe")("sk_test_XeDPiHJAHgK60Nq4wNtEcaVU");

    // ********************* verify if 2 users have already an existant chat room **************************
    Room.remoteMethod(
        'verify', {
            accepts: [
                { arg: 'user1', type: 'string', 'http': { source: 'query' } },
                { arg: 'user2', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Room.verify = function(user1, user2, cb) {
            //Room.find({ "where": { "or": [{ "and": [{ user1: user1, user2: user2 }] },"and" [{ user2: user1, user1: user2 }]] } }, function (err, room_inst) {
            Room.find(function(err, room_inst) {
                    let index = 0
                    let verif = false
                    while (index < room_inst.length && verif == false) {
                        if ((room_inst[index].user1 == user1 && room_inst[index].user2 == user2) || (room_inst[index].user1 == user2 && room_inst[index].user2 == user1)) {
                            return cb(err, room_inst[index]);
                            verif = true
                        }
                        index++
                    }
                    if (verif == false) {
                        var error = new Error();
                        error.status = 404;
                        error.message = 'Aucune room trouvé avec ces informations';
                        return cb(error)
                    }
                })
                // });
        }
        // ********************* verify if 2 users have already an existant chat room **************************

    // ********************* get contract's user ***********************
    Room.remoteMethod(
        'get_contacts', {
            accepts: [
                { arg: 'cncted_id', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Room.get_contacts = function(cncted_id, cb) {
            Room.find(function(err, room_inst) {
                var room_list = []
                let his = []
                for (let index = 0; index < room_inst.length; index++) {
                    if (room_inst[index].user1 == cncted_id) {
                        room_list.push({ "room_id": room_inst[index].room_id, "user_id": room_inst[index].user2 })
                    }
                    if (room_inst[index].user2 == cncted_id) {
                        room_list.push({ "room_id": room_inst[index].room_id, "user_id": room_inst[index].user1 })
                    }
                }
                return cb(err, room_list)
            })
        }
        // ********************* end get contract's user ***********************

    // ********************* get last active chatroom ***********************
    Room.remoteMethod(
        'get_last_room', {
            accepts: [
                { arg: 'user', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Room.get_last_room = function(user, cb) {
            Room.find(function(err, room_inst) {
                let res = []
                let loop = []
                for (let index = 0; index < room_inst.length; index++) {
                    if (room_inst[index].user1 == user.user_id || room_inst[index].user2 == user.user_id) {
                        res.push(room_inst[index].room_id)
                    }
                }
                Room.app.models.messages.find(function(err, msg_inst) {
                    for (let index = 0; index < msg_inst.length; index++) {
                        if (res[res.length - 1] == msg_inst[index].room_id) {
                            loop.push(msg_inst[index])
                        }
                    }
                    return cb(err, { last_room: res[res.length - 1], receiver: loop[loop.length - 1] })
                })
            })
        }
        // ********************* end get last active chatroom ***********************

    // ****************** return data needed in side bar chat section ******************
    Room.remoteMethod(
        'get_contact_details', {
            accepts: [
                { arg: 'room_id', type: 'string', 'http': { source: 'query' } },
                { arg: 'user_type', type: 'string', 'http': { source: 'query' } },
                { arg: 'cncted_id', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    //cncted id is (brand_id or inf_id)
    Room.get_contact_details = function(room_id, user_type, cncted_id, cb) {
        Room.findOne({ "where": { room_id: room_id } }, function(err, room_inst) {
            var sid = ""
            if (room_inst.user1 == cncted_id) {
                sid = room_inst.user2
            }
            if (room_inst.user2 == cncted_id) {
                sid = room_inst.user1
            }
            //console.log(sid);
            let loop = []
            var verif = false
            Room.app.models.messages.find({ where: { room_id: { "regexp": `^${room_id}/i` } } }, function(err, msg_inst) {
                for (let index = 0; index < msg_inst.length; index++) {
                    //if (room_id == msg_inst[index].room_id) {
                    loop.push({ "text": msg_inst[index].text, "sent_at": msg_inst[index].sent_at, "contract_type": msg_inst[index].contract_type })
                        // }
                }
                if (user_type == 'brand') {
                    Room.app.models.inf_register.findOne({ where: { inf_id: sid } }, function(err, inf_instance) {
                        if (inf_instance) {
                            return cb(err, { "inf_id": inf_instance.inf_id, "name": inf_instance.inf_name, "logo": inf_instance.account_image, "room_id": room_id, "user2_id": sid, "last_message": loop[loop.length - 1] })
                        }
                    })
                }
                if (user_type == "influenceur") {
                    Room.app.models.brand_register.findOne({ where: { brand_id: sid } }, function(err, br_instance) {
                        var name = ""
                        var logo = ""
                        var index = 0
                        if (br_instance) {
                            return cb(err, { "name": br_instance.brand_name, "logo": br_instance.account_image, "room_id": room_id, "user2_id": sid, "last_message": loop[loop.length - 1] })
                        }
                    })
                }

            })
        })
    }

    // 

    // ************* return chat between 2 users ****************
    Room.remoteMethod(
        'get_discussion', {
            accepts: [
                { arg: 'room_id', type: 'string', 'http': { source: 'query' } },
                { arg: 'cncted_id', type: 'string', 'http': { source: 'query' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Room.get_discussion = function(room_id, cncted_id, cb) {
            Room.app.models.messages.find({ where: { room_id: { "regexp": `^${room_id}/i` } } }, function(err, msg_inst) {
                let loop = []
                let is_me = false
                let photo = ""
                Room.findOne({ "where": { room_id: room_id } }, function(err, room_inst) {
                    var sid = ""
                    if (room_inst.user1 == cncted_id) {
                        sid = room_inst.user2
                    }
                    if (room_inst.user2 == cncted_id) {
                        sid = room_inst.user1
                    };
                    Room.app.models.inf_register.findOne({ where: { inf_id: sid } }, function(err, inf_inst) {
                        if (inf_inst) {
                            photo = inf_inst.account_image
                        }
                        Room.app.models.brand_register.findOne({ where: { brand_id: sid } }, function(err, br_inst) {
                            if (br_inst) {
                                photo = br_inst.account_image
                            }
                            for (let index = 0; index < msg_inst.length; index++) {
                                if (cncted_id == msg_inst[index].sender) {
                                    is_me = true
                                } else {
                                    is_me = false
                                }
                                loop.push({ "text": msg_inst[index].text, "is_me": is_me, "sent_at": msg_inst[index].sent_at, "user2_id": sid, "photo": msg_inst[index].photo, "message": msg_inst[index] })
                            }
                            return cb(err, { "discussion": loop, "photo": photo })
                        })
                    })
                })
            })
        }
        // ************* return chat between 2 users *********************************************

    // ********************** delete chat *******************************
    Room.remoteMethod(
        'not_interested', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Room.not_interested = function(data, cb) {
            var options = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
            Room.findOne({ where: { room_id: data.room_id } }, function(err, room_inst) {
                Room.app.models.messages.find(function(err1, msg_inst) {
                    for (let index = 0; index < msg_inst.length; index++) {
                        if (msg_inst[index].room_id == data.room_id) {
                            needle.delete('http://localhost:3000/api/messages/' + msg_inst[index].msg_id, data, options, function(err2, res) {
                                if (err2) {
                                    return cb(err2)
                                }
                            })
                        }
                    }
                })
                needle.delete('http://localhost:3000/api/rooms/' + data.room_id, data, options, function(err3, res) {
                    return cb(err3, "deleted")
                })
                if (err) {
                    return cb(err)
                }
            })
        }
        // **********************end delete chat *******************************
};