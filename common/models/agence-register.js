'use strict';

module.exports = function(Agenceregister) {
    var app = require('../../server/server')
    const moment = require('moment')
    const cron = require('node-cron');
    const User = app.models.pylk_account;
    const Inf = app.models.inf_register;
    const Contr = app.models.contract;
    const comp = app.models.compayn;
    const room = app.models.room;
    const msg = app.models.messages;
    const notif = app.models.notification;
    const needle = require('needle');
    const Stats = app.models.statistiques;
    const stripe = require("stripe")("sk_test_XeDPiHJAHgK60Nq4wNtEcaVU");
    // ************ send request to agency for add influenceur  ******************
    Agenceregister.remoteMethod(
        'agency_add_inf', {
            accepts: [
                { arg: 'agn', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Agenceregister.agency_add_inf = function(agn, cb) {
        Agenceregister.find({ where: { agence_id: agn.agence_id } }, function(err, agenceInstance) {
            let index = 0,
                verif = false
            while (index < agenceInstance[0].inf_list.length && !verif) {
                if (agenceInstance[0].inf_list[index].inf_id == agn.inf_id) {
                    return cb(err, "ces deux comptes sont deja associé")
                    verif = true
                }
                index++
            }
            if (!verif) {
                Agenceregister.app.models.inf_register.findOne({ where: { inf_id: agn.inf_id } }, function(err1, inf_inst) {


                    agenceInstance[0].inf_list.push({ "inf_id": agn.inf_id, "status": "waiting", "inf_name": inf_inst.inf_name, "date": new Date() })
                    agenceInstance[0].save()
                    return cb(err, agenceInstance);
                })
            }
        })
    };
    // ************ end send request to agency for add influenceur  ******************


    // ***************** accept inf request to add agency ******************
    Agenceregister.remoteMethod(
        'agency_accept', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Agenceregister.agency_accept = function(data, cb) {
            Agenceregister.findOne({ where: { agence_id: data.agence_id } }, function(err, agc_inst) {
                let index = 0
                found = false
                while (index < agc_inst.inf_list.length && !found) {
                    if (agc_inst.inf_list[index].inf_id == data.inf_id) {
                        agc_inst.inf_list[index].status = "accpted"
                        agc_inst.save()
                        found = true
                        return cb(err, "success")
                    }
                    index++
                }
            })
        }
        // ***************** end accept inf request to add agency ******************

    // ***************** decline inf request to add agency ******************
    Agenceregister.remoteMethod(
        'agency_decline', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Agenceregister.agency_decline = function(data, cb) {
            Agenceregister.findOne({ where: { agence_id: data.agence_id } }, function(err, agc_inst) {
                let index = 0
                found = false
                while (index < agc_inst.inf_list.length && !found) {
                    if (agc_inst.inf_list[index].inf_id == data.inf_id) {
                        agc_inst.inf_list.splice(index, 1)
                        agc_inst.save()
                        found = true
                        return cb(err, "success")
                    }
                    index++
                }
            })
        }
        // ***************** end decline inf request to add agency ***********************************
        // ***************** search for agency instance by id *************************************
    Agenceregister.remoteMethod(
        'get_single_agency', {
            accepts: [
                { arg: 'agence_id', type: 'string', 'http': { source: 'query' } },
            ],
            http: { path: '/get_single_agency', verb: 'get' },
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Agenceregister.get_single_agency = function(brand_id, cb) {
            Agenceregister.find({ where: { agence_id: agence_id } }, function(err, agence_instance) {
                if (agence_instance[0]) {
                    return cb(err, agence_instance[0]);
                } else {
                    return cb(err, {
                        title: "no match found with this id"
                    })
                }
            })
        }
        // ***************** end search for agency instance by id *************************************

    // **********************  change account's agency image ********************
    Agenceregister.remoteMethod(
        'account_photo', {
            accepts: [
                { arg: 'photo', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Agenceregister.account_photo = function(photo, cb) {
            Agenceregister.findOne({ where: { agence_id: photo.agence_id } }, function(err, br_inst) {
                br_inst.account_image = photo.photo
                br_inst.save()
                return cb(err, br_inst)
            })
        }
        // **********************end change account's agency image ********************
        // ******************* return influencers that belongs to a specific egency ************************
    Agenceregister.remoteMethod(
        'my_infs', {
            accepts: [
                { arg: 'agn', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Agenceregister.my_infs = function(agn, cb) {
            Agenceregister.findOne({ where: { agence_id: agn.agence_id } }, function(err, agc_inst) {
                let res = []
                if (agc_inst) {
                    Agenceregister.app.models.inf_register.find(function(err, inf_inst) {
                        for (let index = 0; index < agc_inst.inf_list.length; index++) {
                            let verif = false,
                                i = 0
                            while (i < inf_inst.length && !verif) {
                                if (agc_inst.inf_list[index].inf_id == inf_inst[i].inf_id) {
                                    res.push(inf_inst[i])
                                    verif = true
                                }
                                i++
                            }
                        }
                        return cb(err, res)
                    })
                } else {
                    return cb(err, "pas d'agence trouvé avec cet id")
                }
            })
        }
        // *******************end return influencers that belongs to a specific egency ************************
        // ******************* remove an infulencer from a specific egency ************************
    Agenceregister.remoteMethod(
        'delete_inf', {
            accepts: [
                { arg: 'agn', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Agenceregister.delete_inf = function(agn, cb) {
            Agenceregister.findOne({ where: { agence_id: agn.agence_id } }, function(err, agc_inst) {
                if (!agc_inst) {
                    return cb(err, "id agence erroné")
                }
                let index = 0,
                    found = false
                while (index < agc_inst.inf_list.length && !found) {
                    if (agc_inst.inf_list[index].inf_id == agn.inf_id) {
                        agc_inst.inf_list.splice(index, 1)
                        agc_inst.save()
                        found = true
                        return cb(err, agc_inst)
                    }
                    index++
                }
                if (!found) {
                    return cb(err, "l'influenceur n'appartient pas a cette agence")
                }
            })
        }
        // *******************end remove an infulencer from a specific egency ************************
};