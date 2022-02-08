'use strict';

const needle = require('needle');
const stripe = require("stripe")("sk_test_XeDPiHJAHgK60Nq4wNtEcaVU");
module.exports = function(Contract) {
    var app = require('../../server/server')
    const moment = require('moment')
    const cron = require('node-cron');
    const User = app.models.pylk_account;
    const agc = app.models.agence_register;
    const comp = app.models.compayn;
    const room = app.models.room;
    const msg = app.models.messages;
    const notif = app.models.notification;
    const needle = require('needle');
    const Stats = app.models.statistiques;
    const stripe = require("stripe")("sk_test_XeDPiHJAHgK60Nq4wNtEcaVU");
    const Br = app.models.brand_register;


    // ************* payment by IBAN/bank transfer *******************************************
    Contract.remoteMethod(
        'payment', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.payment = function(data, cb) {
            Contract.findOne({ where: { contract_id: data.contract_id } }, function(err, contr_inst) {
                if (contr_inst && !err) {
                    err5 = new Error()
                    err5.status = 404
                    if (data.iban) {
                        stripe.tokens.create({
                            bank_account: {
                                country: 'DE',
                                currency: 'eur',
                                account_holder_name: data.name,
                                account_holder_type: 'individual',
                                // account_holder_type: 'company',
                                account_number: data.iban
                            }
                        }, function(err1, token) {
                            //console.log("token1", token);
                            //console.log("err1",err1);
                            if (err1) {
                                err5.message = err1.raw.message
                                return cb(err5, err5.message)
                            }
                            if (token) {
                                stripe.charges.create({
                                    amount: data.amount * 100,
                                    currency: "eur",
                                    description: data.contrat_name,
                                    source: token.id,
                                }, function(err2, charge) {
                                    if (err2) {
                                        err5.message = err2.raw.message
                                        return cb(err5, err5.message)
                                    }
                                    if (charge) {
                                        contr_inst.paid = true
                                        contr_inst.charge = charge.id
                                            /*  contr_inst.pay_history.date = new Date()
                                             contr_inst.pay_history.iban = iban
                                             contr_inst.pay_history.name = name
                                             contr_inst.pay_history.amount = amount */
                                            // contr_inst.pay_history.iban = iban
                                        contr_inst.save()
                                        if (!err2) {
                                            Contract.app.models.statistiques.find(function(err, stat_inst) {
                                                stat_inst[0].ca_day = stat_inst[0].ca_day + parseInt(data.amount)
                                                stat_inst[0].ca_week = stat_inst[0].ca_week + parseInt(data.amount)
                                                stat_inst[0].ca_month = stat_inst[0].ca_month + parseInt(data.amount)
                                                stat_inst.save()
                                            })
                                        }
                                        return cb(err2, {
                                            success: true,
                                            contrat: contr_inst
                                        })
                                    }
                                });
                            }
                        });
                    } else {
                        stripe.tokens.create({
                            card: {
                                "number": data.cc_number,
                                "exp_month": data.month,
                                "exp_year": data.year,
                                "cvc": data.cvc
                            }
                        }, function(err3, token) {
                            if (token) {
                                stripe.charges.create({
                                    amount: data.amount * 100,
                                    currency: "eur",
                                    description: data.contrat_name,
                                    source: token.id,
                                }, function(err4, charge) {
                                    if (charge) {
                                        contr_inst.paid = true
                                            /* contr_inst.charge = charge.id
                                            contr_inst.pay_history.date = new Date()
                                            contr_inst.pay_history.card_num = cc_number
                                            contr_inst.pay_history.name = name
                                            contr_inst.pay_history.amount = amount */
                                            // contr_inst.pay_history.iban = iban
                                        contr_inst.save()
                                        Contract.app.models.statistiques.find(function(err, stat_inst) {
                                            stat_inst[0].ca_day = stat_inst[0].ca_day + parseInt(data.amount)
                                            stat_inst[0].ca_week = stat_inst[0].ca_week + parseInt(data.amount)
                                            stat_inst[0].ca_month = stat_inst[0].ca_month + parseInt(data.amount)
                                            stat_inst[0].save()
                                        })
                                        return cb(err, {
                                            success: true,
                                            contrat: contr_inst
                                        })
                                    } else {
                                        err5.message = err4.raw.message
                                        return cb(err5, err5.message)
                                    }
                                });
                            }
                            if (err3) {
                                err5.message = err3.raw.message
                                return cb(err5, err5.message)
                            }
                            // asynchronously called
                        });
                    }
                } else {
                    return cb(err, "contract not found")
                }
            })
        }
        // ************* payment by IBAN/bank transfer *******************************

    // ************* accept global condition from user ***************************
    Contract.remoteMethod(
        'accept_cgu', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.accept_cgu = function(data, cb) {
            Contract.findOne({ where: { contract_id: data.contract_id } }, function(err, contr_inst) {
                if (data.user_type == "influenceur") {
                    contr_inst.cgu_inf = true
                    contr_inst.save()
                    Contract.app.models.room.findOne({ where: { contract_id: { "regexp": `^${contr_inst.contract_id}/i` } } }, function(err, room_inst) {
                        if (!contr_inst.cgu_brand) {
                            Contract.app.models.messages.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.inf_id, sender: "pylk", text: "en attente de l acceptation de la marque", text2: "attenteMarque", sent_at: new Date(), status: "accepted" })
                            Contract.app.models.notification.create({ title: "message notification", user_id: contr_inst.inf_id, /* user_off: data.user_id, action: data.action, */ message: "en attente de l acceptation de la marque" })
                        } else {
                            Contract.app.models.messages.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.inf_id, sender: "pylk", text: "les deux part ont accepté les conditions générales", text2: "2accptee", sent_at: new Date(), status: "accepted" })
                            Contract.app.models.notification.create({ title: "message notification", user_id: contr_inst.inf_id, /* user_off: data.user_id, action: data.action, */ message: "les deux part ont accepté les conditions générales" })
                        }
                    })
                }
                if (data.user_type == "brand") {
                    contr_inst.cgu_brand = true
                    contr_inst.save()
                    Contract.app.models.room.findOne({ where: { contract_id: { "regexp": `^${contr_inst.contract_id}/i` } } }, function(err, room_inst) {

                        if (!contr_inst.cgu_inf) {
                            Contract.app.models.messages.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.brand_id, sender: "pylk", text: "en attente de l acceptation de l influenceur", text2: "attenteInf", sent_at: new Date(), status: "accepted" })
                            Contract.app.models.notification.create({ title: "message notification", user_id: contr_inst.brand_id, /* user_off: data.user_id, action: data.action, */ message: "en attente de l acceptation de l influenceur" })
                        } else {
                            Contract.app.models.messages.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.brand_id, sender: "pylk", text: "les deux part ont accepté les conditions générales", text2: "2accptee", sent_at: new Date(), status: "accepted" })
                            Contract.app.models.notification.create({ title: "message notification", user_id: contr_inst.brand_id, /* user_off: data.user_id, action: data.action, */ message: "les deux part ont accepté les conditions générales" })
                        }
                    })
                }
                return cb(err, contr_inst)
            })
        }
        // ************* end accept global condition from user ***************************
        // ************* confirm contract promo *****************************
    Contract.remoteMethod(
        'confirm_promo', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.confirm_promo = function(data, cb) {
            Contract.findOne({ where: { contract_id: data.contract_id } }, function(err, contr_inst) {
                if (data.user_type == "influenceur") {
                    contr_inst.confirm_inf = true
                    contr_inst.save()
                    Contract.app.models.room.findOne({ where: { contract_id: { "regexp": `^${contr_inst.contract_id}/i` } } }, function(err, room_inst) {
                        if (!contr_inst.confirm_brand) {
                            msg.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.inf_id, sender: "pylk", text: "en attente de la confirmation de la marque", text2: "attenteConfirmMarque", sent_at: new Date(), status: "accepted" })
                            notif.create({ title: "message notification", user_id: contr_inst.inf_id, /* user_off: data.user_id, action: data.action, */ message: "en attente de la confirmation de la marque" })
                        } else {
                            msg.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.inf_id, sender: "pylk", text: "veuillez noter", text2: "2confirm", sent_at: new Date(), status: "accepted" })
                            notif.create({ title: "message notification", user_id: contr_inst.inf_id, /* user_off: data.user_id, action: data.action, */ message: "veuillez noter" })
                        }
                    })
                }
                if (data.user_type == "brand") {
                    contr_inst.confirm_brand = true
                    contr_inst.save()
                    Contract.app.models.room.findOne({ where: { contract_id: { "regexp": `^${contr_inst.contract_id}/i` } } }, function(err, room_inst) {
                        if (!contr_inst.confirm_inf) {
                            Contract.app.models.messages.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.brand_id, sender: "pylk", text: "en attente de la confirmation de l influenceur", text2: "attenteConfirmInf", sent_at: new Date(), status: "accepted" })
                            Contract.app.models.notification.create({ title: "message notification", user_id: contr_inst.brand_id, /* user_off: data.user_id, action: data.action, */ message: "en attente de la confirmation de l influenceur" })
                        } else {
                            Contract.app.models.messages.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.brand_id, sender: "pylk", text: "veuillez noter", text2: "2confirm", sent_at: new Date(), status: "accepted" })
                            Contract.app.models.notification.create({ title: "message notification", user_id: contr_inst.brand_id, /* user_off: data.user_id, action: data.action, */ message: "veuillez noter" })
                        }
                    })
                }
                return cb(err, contr_inst)
            })
        }
        // ********************* end confirm contract promo *****************************

    // ******************** create new contract ***********************
    Contract.remoteMethod(
        'generating_contract', {
            accepts: [
                { arg: 'contract', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.generating_contract = function(contract, cb) {
            //generating contract
            Contract.app.models.brand_register.findOne({ where: { brand_id: contract.brand_id } }, function(err1, br_inst) {
                Contract.app.models.inf_register.findOne({ where: { inf_id: contract.inf_id } }, function(err2, inf_inst) {
                    Contract.create({
                            inf_id: contract.inf_id,
                            brand_id: contract.brand_id,
                            brand_name: contract.brand_name,
                            inf_name: contract.inf_name,
                            brand_image: br_inst.account_image,
                            inf_image: inf_inst.account_image,
                            starts_date: contract.starts_date,
                            end_date: contract.end_date,
                            start_time: contract.start_time,
                            end_time: contract.end_time,
                            created_at: new Date(),
                            produit_envoyer: contract.produit_envoyer,
                            description: contract.description,
                            clauses: contract.clauses,
                            prix: contract.prix,
                            reseaux: contract.reseaux,
                            type: contract.type,
                            attachements: contract.attachements,
                            file_name: contract.file_name,
                            deadligne: contract.deadligne,
                            criteres: contract.criteres,
                            panier: contract.panier
                        },
                        function(err, contr_inst) {
                            contr_inst.save();
                            // ********** adding collaboration ***********
                            Contract.app.models.inf_register.findOne({ where: { inf_id: contract.inf_id } }, function(err, inf_inst) {
                                    let index = 0,
                                        verif = false
                                        // ************ creating new discussion room *************
                                    Contract.app.models.room.create({ user1: contract.brand_id, user2: contract.inf_id, contract_id: contr_inst.contract_id }, function(err, room_inst) {
                                            // ******sending automatic message to inf******** 
                                            Contract.app.models.messages.create({
                                                    room_id: room_inst.room_id,
                                                    contract_id: contr_inst.contract_id,
                                                    receiver: contract.inf_id,
                                                    sender: contract.brand_id,
                                                    brand_name: contract.brand_name,
                                                    inf_name: contract.inf_name,
                                                    clauses: contract.clauses,
                                                    starts_date: contract.starts_date,
                                                    end_date: contract.end_date,
                                                    start_time: contract.start_time,
                                                    end_time: contract.end_time,
                                                    reseaux: contract.reseaux,
                                                    description: contract.description,
                                                    attachements: contract.attachements,
                                                    file_name: contract.file_name,
                                                    prix: contract.prix,
                                                    deadligne: contract.deadligne,
                                                    contract_type: contract.type,
                                                    sent_at: new Date(),
                                                    criteres: contract.criteres,
                                                    produit_envoyer: contract.produit_envoyer,
                                                    panier: contract.panier,
                                                    status: contr_inst.status,
                                                    negociated: false
                                                })
                                                // ******end sending automatic message to inf********
                                        })
                                        // ************ end creating new discussion room *************
                                    while (index < inf_inst.collaboration.length && !verif) {
                                        if (inf_inst.collaboration[index].brand_id == contract.brand_id) {
                                            verif = true
                                        }
                                        index++
                                    }
                                    if (!verif) {
                                        Contract.app.models.brand_register.findOne({ where: { brand_id: contract.brand_id } }, function(err, br_inst) {
                                            inf_inst.collaboration.push({ "brand_id": contract.brand_id, "account_image": br_inst.account_image })
                                            inf_inst.save()
                                        })
                                    }
                                })
                                // ********** end adding collaboration ***********
                            return cb(err, contr_inst)
                        })
                })
            })
        }
        // ******************** end create new contract ***********************

    // ******************** user refuse contract proposition *****************
    Contract.remoteMethod(
        'refuse_contract', {
            accepts: [
                { arg: 'contract', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.refuse_contract = function(contract, cb) {
            Contract.findOne({ where: { contract_id: contract.contract_id } }, function(err, contr_inst) {
                contr_inst.status = "refused";
                contr_inst.save()
                Contract.app.models.messages.create({
                    room_id: contract.room_id,
                    contract_id: contr_inst.contract_id,
                    receiver: contract.receiver,
                    sender: contract.sender,
                    text: contract.text,
                    clauses: contr_inst.clauses,
                    brand_name: contr_inst.brand_name,
                    inf_name: contr_inst.inf_name,
                    starts_date: contr_inst.starts_date,
                    end_date: contr_inst.end_date,
                    time_start: contr_inst.time_start,
                    end_time: contr_inst.end_time,
                    reseaux: contr_inst.reseaux,
                    description: contr_inst.description,
                    attachements: contr_inst.attachements,
                    prix: contr_inst.prix,
                    deadligne: contr_inst.deadligne,
                    contract_type: contr_inst.type,
                    sent_at: new Date(),
                    produit_envoyer: contr_inst.produit_envoyer,
                    file_name: contr_inst.file_name,
                    panier: contr_inst.panier,
                    status: contr_inst.status,
                    negociated: true
                }, function(err, msg_inst) {
                    return cb(err, msg_inst)
                })
            })
        }
        // ********************end user refuse contract proposition *****************

    // ******************* user negociate contract terms *************************
    Contract.remoteMethod(
        'negociate', {
            accepts: [
                { arg: 'contract', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.negociate = function(contract, cb) {
            // let now = new Date()
            Contract.findOne({ where: { contract_id: contract.contract_id } }, function(err, contr_inst) {
                if (contract.starts_date) {
                    contr_inst.starts_date = contract.starts_date
                }
                if (contract.end_date) {
                    contr_inst.end_date = contract.end_date
                }
                if (contract.time_start) {
                    contr_inst.start_time = contract.start_time
                }
                if (contract.time_end) {
                    contr_inst.time_end = contract.time_end
                }
                if (contract.produit_envoyer) {
                    contr_inst.produit_envoyer = contract.produit_envoyer
                }
                if (contract.description) {
                    contr_inst.description = contract.description
                }
                if (contract.clauses) {
                    contr_inst.clauses = contract.clauses
                }
                if (contract.prix) {
                    contr_inst.prix = contract.prix
                }
                if (contract.reseaux) {
                    contr_inst.reseaux = contract.reseaux
                }
                if (contract.type) {
                    contr_inst.type = contract.type
                }
                if (contract.attachements) {
                    contr_inst.attachements = contract.attachements
                }
                if (contract.deadligne) {
                    contr_inst.deadligne = contract.deadligne
                }
                if (contract.criteres) {
                    contr_inst.criteres = contract.criteres
                }
                if (contract.panier) {
                    contr_inst.panier = contract.panier
                }
                if (contract.links) {
                    contr_inst.links = contract.links
                }
                contr_inst.save()
                if (contr_inst.status != "accepted") {
                    Contract.app.models.messages.findOne({ where: { msg_id: contract.msg_id } }, function(err, message) {
                        message.negociated = true;
                        message.save()
                    })
                    Contract.app.models.messages.create({
                        room_id: contract.room_id,
                        contract_id: contr_inst.contract_id,
                        receiver: contract.receiver,
                        sender: contract.sender,
                        links: contract.links,
                        brand_name: contr_inst.brand_name,
                        inf_name: contr_inst.inf_name,
                        text: contract.text,
                        clauses: contr_inst.clauses,
                        starts_date: contr_inst.starts_date,
                        end_date: contr_inst.end_date,
                        start_time: contr_inst.start_time,
                        end_time: contr_inst.end_time,
                        reseaux: contr_inst.reseaux,
                        description: contr_inst.description,
                        attachements: contr_inst.attachements,
                        prix: contr_inst.prix,
                        deadligne: contr_inst.deadligne,
                        contract_type: contr_inst.type,
                        sent_at: new Date(),
                        criteres: contract.criteres,
                        produit_envoyer: contr_inst.produit_envoyer,
                        file_name: contr_inst.file_name,
                        panier: contr_inst.panier,
                        status: contr_inst.status,
                        negociated: false
                    }, function(err, msg_inst) {
                        if (err) {
                            return cb(err)
                        }
                        return cb(err, msg_inst)
                    })
                }
            })
        }
        // ******************* user negociate contract terms *************************


    // ******************* user negociate contract terms *************************
    Contract.remoteMethod(
        'accept_contract', {
            accepts: [
                { arg: 'contract', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.accept_contract = function(contract, cb) {
            Contract.findOne({ where: { contract_id: contract.contract_id } }, function(err, contr_inst) {
                contr_inst.status = "accepted";
                contr_inst.save()
                Contract.app.models.messages.create({
                    room_id: contract.room_id,
                    contract_id: contr_inst.contract_id,
                    brand_name: contr_inst.brand_name,
                    inf_name: contr_inst.inf_name,
                    receiver: contract.receiver,
                    sender: contract.sender,
                    text: contract.text,
                    clauses: contr_inst.clauses,
                    starts_date: contr_inst.starts_date,
                    end_date: contr_inst.end_date,
                    time_start: contr_inst.time_start,
                    end_time: contr_inst.end_time,
                    reseaux: contr_inst.reseaux,
                    description: contr_inst.description,
                    attachements: contr_inst.attachements,
                    prix: contr_inst.prix,
                    deadligne: contr_inst.deadligne,
                    contract_type: contr_inst.type,
                    sent_at: new Date(),
                    produit_envoyer: contr_inst.produit_envoyer,
                    file_name: contr_inst.file_name,
                    panier: contr_inst.panier,
                    status: contr_inst.status,
                    negociated: true
                }, function(err, msg_inst) {
                    Contract.app.models.room.findOne({ where: { contract_id: { "regexp": `^${contr_inst.contract_id}/i` } } }, function(err, room_inst) {
                        // msg.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.brand_id, sender: "pylk", text: "génération du contrat", text2:"generation", sent_at: new Date(), status: "accepted" })
                        // notif.create({ title: "message notification", user_id: contr_inst.brand_id, /* user_off: data.user_id, action: data.action, */ message: "génération du contrat" })
                        Contract.app.models.messages.create({ notif: true, contract_id: contr_inst.contract_id, room_id: room_inst.room_id, receiver: contr_inst.inf_id, sender: "pylk", text: "génération du contrat", text2: "generation", sent_at: new Date(), status: "accepted" })
                        Contract.app.models.notification.create({ title: "message notification", user_id: contr_inst.inf_id, /* user_off: data.user_id, action: data.action, */ message: "génération du contrat" })
                    })
                    return cb(err, msg_inst)
                })
            })
        }
        // *******************end user negociate contract terms *************************

    //****************** return brand's contracts *******************************
    Contract.remoteMethod(
        'get_all_contracts', {
            accepts: [
                { arg: 'cncted_id', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.get_all_contracts = function(cncted_id, cb) {
            Contract.find({ where: { brand_id: { "regexp": `^${cncted_id}/i` } } }, function(err, contr_inst) {
                return cb(err, contr_inst)
            })
        }
        // ******************end return brand's contracts *******************************

    // ***************** return influencer's contracts *****************************
    Contract.remoteMethod(
        'mes_contrats', {
            accepts: [
                { arg: 'cncted_id', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.mes_contrats = function(cncted_id, cb) {
            Contract.find(function(err, contr_inst) {
                let res = []
                for (let index = 0; index < contr_inst.length; index++) {
                    if (contr_inst[index].inf_id == cncted_id) {
                        res.push(contr_inst[index])
                    }
                }
                return cb(err, res)
            })
        }
        // ***************** return influencer's contracts *****************************

    // ******************* make contract cloture (administrator side)********************
    Contract.remoteMethod(
        'admin_cloturer', {
            accepts: [
                { arg: 'contract', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.admin_cloturer = function(contract, cb) {
            Contract.findOne({ where: { contract_id: contract.contract_id } }, function(err, contr_inst) {
                if (contr_inst) {
                    contr_inst.cloture = true
                    contr_inst.save()
                    return cb(err, "sucess")
                } else {
                    return cb(err, "no contract found with this id")
                }
            })
        }
        // ********************* remove contract from list (brand side) ****************
    Contract.remoteMethod(
        'remove_contract', {
            accepts: [
                { arg: 'contract_id', type: 'string', 'http': { source: 'body' } },
                { arg: 'cncted_id', type: 'string', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.remove_contract = function(cncted_id, contract_id, cb) {
            console.log(contract_id);

            Contract.find({ where: { brand_id: { "regexp": `^${cncted_id}/i` } } }, function(err, contr_inst) {
                //  console.log("contr_insta", contr_inst);

                for (let index = 0; index < contr_inst.length; index++) {
                    console.log("contract entred id", contract_id, "in db", contr_inst[index].contract_id);



                    /* if (contr_inst[index].contract_id == contract_id) {
                        console.log("index done", index);
                        contr_inst.splice(index, 1)
                        contr_inst.save()
                    } */

                }
                return cb(err, contr_inst)
            })
        }
        // ********************* remove contract from list (brand side) ****************

    // ******************* end make contract cloture (administrator side)********************
    // ******************* make contract cloture (user side)********************
    Contract.remoteMethod(
        'cloturer', {
            accepts: [
                { arg: 'contract_id', type: 'string', 'http': { source: 'query' } },
                { arg: 'note_brand', type: 'number', 'http': { source: 'query' } },
                { arg: 'note_inf', type: 'number', 'http': { source: 'query' } },
                { arg: 'inf_id', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.cloturer = function(contract_id, note_brand, note_inf, inf_id, cb) {
            Contract.findOne({ where: { contract_id: contract_id } }, function(err, contr_inst) {
                if (note_brand) {
                    contr_inst.note_brand = note_brand
                }
                if (note_inf) {
                    contr_inst.note_inf = note_inf
                }
                if (contr_inst.note_inf > 0 && contr_inst.note_brand > 0) {
                    contr_inst.cloture = true
                }
                contr_inst.save();
                if (inf_id) {
                    Contract.find({ where: { inf_id: { "regexp": `^${inf_id}/i` } } }, function(err, ct_inst) {
                        let nb = ct_inst.length
                        var rating = 0
                        for (let index = 0; index < ct_inst.length; index++) {
                            if (ct_inst[index].note_brand) {
                                rating = rating + ct_inst[index].note_brand
                            }
                        }
                        rating = rating / nb
                        Inf.findOne({ where: { inf_id: inf_id } }, function(err, inf_inst) {
                            inf_inst.rating = rating
                            inf_inst.save()
                            return cb(err, inf_inst)
                        })
                    })
                }
            })
        }
        // ******************* make contract cloture (user side)********************

    // ********************* search for a contract by id ******************
    Contract.remoteMethod(
        'get_single_contr', {
            accepts: [
                { arg: 'contract', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Contract.get_single_contr = function(contract, cb) {
            Contract.findOne({ where: { contract_id: contract.contract_id } }, function(err, contr_inst) {
                if (contr_inst) {
                    return cb(err, contr_inst)
                } else { return cb(err, "no contract found") }
            })
        }
        // ********************* end search for a contract by id ******************

    // ************* Administration: get lastest contracts ***************
    Contract.remoteMethod(
        'lastest_contracts', {
            http: { path: '/lastest_contracts', verb: 'get' },
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Contract.lastest_contracts = function(cb) {
        let res = []
        Contract.find(function(err, contr_inst) {
            if (contr_inst.length > 10) {
                for (let index = contr_inst.length - 10; index < contr_inst.length; index++) {
                    res.push(contr_inst[index])
                }
            } else {
                return cb(err, contr_inst)
            }


        })
    }
};