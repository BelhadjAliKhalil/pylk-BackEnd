'use strict';

module.exports = function(Compayn) {
    var app = require('../../server/server')

    // ********************* add new inluencer to compayn *************************
    Compayn.remoteMethod(
        'update_inf_list', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Compayn.update_inf_list = function(inf, cb) {
            Compayn.find({ where: { compayn_id: inf.compayn_id } }, function(err, compayn_inst) {
                Compayn.app.models.inf_register.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
                    compayn_inst[0].inf_list.push(inf_inst)
                    compayn_inst[0].save()
                    return cb(err, compayn_inst);
                });
            })
        }
        // ********************* end add new inluencer to compayn *************************

    // ********************* delete inluencer from compayn *************************
    Compayn.remoteMethod(
        'delete_inf', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Compayn.delete_inf = function(inf, cb) {
            Compayn.findOne({ where: { compayn_id: inf.compayn_id } }, function(err, compayn_inst) {
                let verif = false
                let index = 0
                while (index < compayn_inst.inf_list.length && verif == false) {
                    if (compayn_inst.inf_list[index].inf_id == inf.inf_id) {
                        compayn_inst.inf_list.splice(index, 1)
                        verif = true
                        compayn_inst.save()
                    }
                    index++
                }
                return cb(err, compayn_inst);
            });
        }
        // ********************* end delete inluencer from compayn *************************
        // ********************* return compayns list that belongs to a specific brand *************************
    Compayn.remoteMethod(
        'get_compayns', {
            accepts: [
                { arg: 'compayn', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Compayn.get_compayns = function(compayn, cb) {
            let res = []
            Compayn.find({ where: { brand_id: { "regexp": `/^${compayn.brand_id}/i` } } }, function(err, compayn_inst) {
                /* for (let index = 0; index < compayn_inst.length; index++) {
                    if (compayn_inst[index].brand_id == compayn.brand_id) {
                        res.push(compayn_inst[index])
                    }
                } */
                return cb(err, compayn_inst);
            });
        }
        // ********************* end return compayns list that belongs to a specific brand ********************
};