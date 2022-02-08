'use strict';
const moment = require('moment')
const cron = require('node-cron')
const needle = require('needle');
const stripe = require("stripe")("sk_test_XeDPiHJAHgK60Nq4wNtEcaVU");
module.exports = function(Pylkaccount) {

    // ********** inscription influenceur ******************
    Pylkaccount.remoteMethod(
        'inf_create', {
            accepts: [
                { arg: 'email', type: 'string', 'http': { source: 'query' } },
                { arg: 'password', type: 'string', 'http': { source: 'query' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Pylkaccount.inf_create = function(email, password, cb) {
        Pylkaccount.find({ where: { email: email } }, function(err, instance) {
            if (!instance[0]) {
                Pylkaccount.create({ email: email, password: password }, function(err, userInstance) {
                    Pylkaccount.find({ where: { email: userInstance.email } }, function(err, accounts) {
                        var createObject = {
                            "managed": true, // required
                            "country": "FR", // required
                            "email": accounts[0].email, // Not required, but we have it anyway
                            "legal_entity": { // required
                                "first_name": "user", // required
                                "last_name": "user_lastName", // required
                                "type": "individual", // required
                                "address": { // required
                                    "city": "madrid", // required
                                    "country": "FR", // required
                                    "line1": "madrid", // required
                                    "line2": "addressLine2", // Not required
                                    "postal_code": 33000, // required
                                    "state": "addressState" // required
                                },
                                "dob": { // required
                                    "day": '01', // required
                                    "month": '02', // required
                                    "year": '1992' // requireddobMM
                                },
                            },
                            "tos_acceptance": { // required
                                "date": Math.floor(Date.now() / 1000), // required
                                "ip": "127.0.0.1" // request.connection.remoteAddress // required
                            }
                        };
                        stripe.accounts.create(createObject, function(err, account) {
                            if (!err || account) {
                                accounts[0].account_id = account.id
                                accounts[0].save()
                            }
                        });
                        accounts[0].created_at = new Date()
                        accounts[0].usertype = "influenceur";
                        accounts[0].save()
                        Pylkaccount.login({
                            email: email,
                            password: password
                        }, 'user', function(err, token) {
                            if (err) {
                                return cb({
                                    title: 'Connexion échoué ',
                                    content: err,
                                    redirectTo: '/',
                                    redirectToLinkText: 'Try again'
                                });
                            }
                            return Pylkaccount.find({ where: { email: email }, limit: 3 }, function(err, accounts) {
                                    var ut = accounts[0].usertype
                                    return cb(err, {
                                        account_id: accounts[0].pylk_account_id,
                                        email: email,
                                        accessToken: token.id,
                                        userType: ut
                                    });
                                })
                                // return 
                        });
                    });
                });
            } else {
                return cb({
                    title: "register failed",
                    content: "email already exist"
                })
            }
        });
    };
    // ********** end inscription influenceur ******************

    // ***************** inscription agency *****************************************************
    Pylkaccount.remoteMethod(
        'agency_create', {
            accepts: [
                { arg: 'email', type: 'string', 'http': { source: 'query' } },
                { arg: 'password', type: 'string', 'http': { source: 'query' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Pylkaccount.agency_create = function(email, password, cb) {
        Pylkaccount.find({ where: { email: email } }, function(err, instance) {
            if (!instance[0]) {
                Pylkaccount.create({ email: email, password: password }, function(err, userInstance) {
                    Pylkaccount.find({ where: { email: userInstance.email }, limit: 3 }, function(err, accounts) {
                        accounts[0].created_at = new Date()
                        accounts[0].usertype = "agence";
                        accounts[0].save()
                        Pylkaccount.login({
                            email: email,
                            password: password
                        }, 'user', function(err, token) {
                            if (err) {
                                return cb({
                                    title: 'Login failed',
                                    content: err,
                                    redirectTo: '/',
                                    redirectToLinkText: 'Try again'
                                });
                            }
                            return Pylkaccount.find({ where: { email: email }, limit: 3 }, function(err, accounts) {
                                    var ut = accounts[0].usertype
                                    return cb(err, {
                                        account_id: accounts[0].pylk_account_id,
                                        email: email,
                                        accessToken: token.id,
                                        userType: ut
                                    });
                                })
                                // return 
                        });
                    });
                });
            } else {
                return cb({
                    title: "echec d'inscription",
                    content: "cette adresse email n'est pas disponible"
                })
            }
        });
    };
    // ***************** end inscription agency *****************************************************
    // ********************** inscription brand *********************************
    Pylkaccount.remoteMethod(
        'brand_create', {
            accepts: [
                { arg: 'email', type: 'string', 'http': { source: 'query' } },
                { arg: 'username', type: 'string', 'http': { source: 'query' } },
                { arg: 'password', type: 'string', 'http': { source: 'query' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Pylkaccount.brand_create = function(email, username, password, cb) {
        Pylkaccount.find({ where: { email: email } }, function(err, instance) {
            if (!instance[0]) {
                Pylkaccount.create({ email: email, name: username, password: password }, function(err, userInstance) {
                    Pylkaccount.find({ where: { email: userInstance.email }, limit: 3 }, function(err, accounts) {
                        var createObject = {
                            "managed": true, // required
                            "country": "FR", // required
                            "email": accounts[0].email, // Not required, but we have it anyway
                            "legal_entity": { // required
                                "first_name": "user", // required
                                "last_name": "user_lastName", // required
                                "type": "individual", // required
                                "address": { // required
                                    "city": "madrid", // required
                                    "country": "FR", // required
                                    "line1": "madrid", // required
                                    "line2": "addressLine2", // Not required
                                    "postal_code": 33000, // required
                                    "state": "addressState" // required
                                },
                                "dob": { // required
                                    "day": '01', // required
                                    "month": '02', // required
                                    "year": '1992' // requireddobMM
                                },
                            },
                            "tos_acceptance": { // required
                                "date": Math.floor(Date.now() / 1000), // required
                                "ip": "127.0.0.1" // request.connection.remoteAddress // required
                            }
                        };
                        stripe.accounts.create(createObject, function(err, account) {
                            if (!err || account) {
                                accounts[0].account_id = account.id
                                accounts[0].save()
                            }
                        });
                        accounts[0].created_at = new Date()
                        accounts[0].usertype = "brand";
                        accounts[0].save()
                        Pylkaccount.login({
                            email: email,
                            password: password
                        }, 'user', function(err, token) {
                            if (err) {
                                return cb({
                                    title: 'Login failed',
                                    content: err,
                                    redirectTo: '/',
                                    redirectToLinkText: 'Try again'
                                });
                            }
                            return Pylkaccount.find({ where: { email: email }, limit: 3 }, function(err, accounts) {
                                    var ut = accounts[0].usertype
                                    return cb(err, {
                                        account_id: accounts[0].pylk_account_id,
                                        email: email,
                                        accessToken: token.id,
                                        userType: ut
                                    });
                                })
                                // return 
                        });
                    });
                })
            } else {
                return cb({
                    title: "register failed",
                    content: "email already exist"
                })
            }
        });
    };
    // ********************** end inscription brand *********************************
};