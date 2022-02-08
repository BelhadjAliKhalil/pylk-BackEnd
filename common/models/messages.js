'use strict';

module.exports = function(Messages) {
    var app = require('../../server/server');
    var room = app.models.rooms;

    // ********************* get messages that belong to a specefic chatroom **************************
    Messages.remoteMethod(
        'get_msg', {
            accepts: [
                { arg: 'room_id', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Messages.get_msg = function(cb) {
            let res = []
            Messages.find({ where: { room_id: room_id } }, function(err, msg_inst) {
                if (msg_inst[0]) {
                    for (let index = 0; index < msg_inst.length; index++) {
                        res.push(msg_inst.text)
                    }
                    return cb(err, res)
                } else {
                    return cb(err, "empty")
                }
            })
        }
        // *********************end get messages that belong to a specefic chatroom **************************

    // ********************* send hello in chat ********************
    Messages.remoteMethod(
        'send_hello', {
            accepts: [
                { arg: 'message', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Messages.send_hello = function(message, cb) {

            Messages.app.models.room.create({ user1: message.sender, user2: message.receiver }, function(err, room_inst) {
                Messages.create({
                    room_id: room_inst.room_id,
                    text: message.text,
                    negociated: true,
                    sender: message.sender,
                    receiver: message.receiver,
                    inf_name: message.username,
                    sent_at: new Date()
                }, function(err, msg_inst) {
                    return cb(err, "success")
                })
            })
        }
        // ********************* end send hello in chat ********************
        // ************* Administration: get discussion of the contract ***************
    Messages.remoteMethod(
        'contract_discussion', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Messages.contract_discussion = function(data, cb) {
        let res = []
        Messages.find(function(err, msg_inst) {
            for (let index = 0; index < msg_inst.length; index++) {
                if (msg_inst[index].contract_id == data.contract_id) {
                    res.push(msg_inst[index])
                }
            }
            return cb(err, res)
        })
    }

}