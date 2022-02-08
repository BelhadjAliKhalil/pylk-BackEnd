'use strict';

module.exports = function(Infregister) {
    var app = require('../../server/server')
    const moment = require('moment')
    const cron = require('node-cron');
    const User = app.models.pylk_account;
    const Contr = app.models.contract;
    const agc = app.models.agence_register;
    const comp = app.models.compayn;
    const room = app.models.room;
    const msg = app.models.messages;
    const notif = app.models.notification;
    const needle = require('needle');
    const Stats = app.models.statistiques;
    const stripe = require("stripe")("sk_test_XeDPiHJAHgK60Nq4wNtEcaVU");
    const Br = app.models.brand_register;

    // ********************** search for influenceur by specific filter ***************
    Infregister.remoteMethod(
        'find_inf', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.find_inf = function(data, cb) {
            let res = []
            let bud_min = 0
            let bud_max = 0
            let ag_min = 0
            let ag_max = 0
            let followers = 0
            let followers_max = 0
            let followers_min = 0
            let sexe = []
            if (data.gender && data.gender[0]) {
                sexe = data.gender
            } else {
                sexe = ["Homme", "Femme", "Life style", ""]
            }
            if (data.followers_max && data.followers_min) {
                followers_max = data.followers_max
                followers_min = data.followers_min
            } else {
                followers_max = 99999999
                followers_min = 0
            }
            if (data.budget_min && data.budget_max) {
                bud_min = data.budget_min
                bud_max = data.budget_max
            } else {
                bud_min = 0
                bud_max = 15000
            }
            if (data.age_min && data.age_max) {
                ag_min = data.age_min
                ag_max = data.age_max
            } else {
                ag_min = 0
                ag_max = 100
            }
            if ((data.lieu[0] && data.categorie[0]) && data.name) {
                Infregister.find({
                        //skip: data.skip, limit: 10,
                        "where": {
                            "and": [{ "inf_name": { "regexp": `^${data.name}/i` } },
                                { lieu: { inq: data.lieu } },
                                { gender: { inq: sexe } },
                                { categorie: { inq: data.categorie } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((data.lieu[0] && !data.categorie[0]) && data.name) {
                Infregister.find({
                        // skip: data.skip, limit: 10,
                        "where": {
                            "and": [{ "inf_name": { "regexp": `^${data.name}/i` } },
                                { lieu: { inq: data.lieu } },
                                { gender: { inq: sexe } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((!data.lieu[0] && data.categorie[0]) && data.name) {
                Infregister.find({
                        // skip: data.skip, limit: 10,
                        "where": {
                            "and": [{ "inf_name": { "regexp": `^${data.name}/i` } },
                                { categorie: { inq: data.categorie } },
                                { gender: { inq: sexe } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((!data.lieu[0] && !data.categorie[0]) && data.name) {
                Infregister.find({
                        //skip: data.skip, limit: 10,
                        "where": {
                            "and": [{ "inf_name": { "regexp": `^${data.name}/i` } },
                                { prix_min: { gte: bud_min } },
                                { gender: { inq: sexe } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((data.lieu[0] && data.categorie[0]) && !data.name) {
                Infregister.find({
                        //skip: data.skip, limit: 10,
                        "where": {
                            "and": [{ lieu: { inq: data.lieu } },
                                { categorie: { inq: data.categorie } },
                                { gender: { inq: sexe } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((data.lieu[0] && !data.categorie[0]) && !data.name) {
                Infregister.find({
                        //  skip: data.skip, limit: 10,
                        "where": {
                            "and": [{ lieu: { inq: data.lieu } },
                                { prix_min: { gte: bud_min } },
                                { gender: { inq: sexe } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((!data.lieu[0] && data.categorie[0]) && !data.name) {
                Infregister.find({
                        // skip: data.skip, limit: 10,
                        "where": {
                            "and": [
                                { categorie: { inq: data.categorie } },
                                { gender: { inq: sexe } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((!data.lieu[0] && !data.categorie[0]) && !data.name) {
                Infregister.find({
                        //  skip: data.skip, limit: 10,
                        "where": {
                            "and": [
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { gender: { inq: sexe } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
        }
        // ********************** end search for influenceur by specific filter ***************


    // ********************** search for influenceur by name ***************
    Infregister.remoteMethod(
        'find_inf2', {
            accepts: [
                { arg: 'name', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.find_inf2 = function(name, cb) {
            var res = []
            Infregister.find({ "where": { "inf_name": { "regexp": `^${name}` } } },
                function(err, inf_instance) {
                    if (inf_instance[0] && !err) {
                        for (let index = 0; index < inf_instance.length; index++) {
                            res.push(inf_instance[index])
                        }
                    } else {
                        return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                    }
                    return cb(err, res)
                })
        }
        // ********************** end search for influenceur by name ***************
        // ***************** search for influenceur by id *****************************************************
    Infregister.remoteMethod(
        'get_single_inf', {
            accepts: [
                { arg: 'inf_id', type: 'string', 'http': { source: 'query' } },
            ],
            http: { path: '/get_single_inf', verb: 'get' },
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.get_single_inf = function(inf_id, cb) {
            Infregister.find({ where: { inf_id: inf_id } }, function(err, inf_instance) {
                if (inf_instance[0]) {
                    return cb(err, inf_instance[0])
                } else {
                    return cb(err, {
                        title: "no match found with this id"
                    })
                }
            })
        }
        // ***************** end search for influenceur by id *******

    // ****************** add bonus for influenceur ****************************************************
    Infregister.remoteMethod(
        'add_bonus', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.add_bonus = function(inf, cb) {
        Infregister.find({ where: { inf_id: inf.inf_id } }, function(err, inf_register) {
            inf_register[0].bonus_card.push({ "number": inf.number, "date": new Date() })
            inf_register[0].save()
            return cb(err, inf_register);
        });
    };
    // ****************** end add bonus for influenceur ****************************************************

    // ********************* get all existant places in the database **************************
    Infregister.remoteMethod(
        'get_lieu', {
            http: { path: '/get_lieu', verb: 'get' },
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.get_lieu = function(cb) {
            Infregister.find(function(err, inf_instance) {
                let res = []
                for (let index = 0; index < inf_instance.length; index++) {
                    if (inf_instance[index].lieu) {
                        let verif = false
                        for (let i = 0; i < res.length; i++) {
                            if (inf_instance[index].lieu == res[i]) {
                                verif = true
                            }
                        }
                        if (verif == false) {
                            res.push(inf_instance[index].lieu)
                        }
                    }
                }
                return cb(err, res)
            })
        }
        // *********************end get all existant places in the database **************************

    // ********************* get all existant influencers categories in the database **************************
    Infregister.remoteMethod(
        'get_categorie', {
            http: { path: '/get_categorie', verb: 'get' },
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.get_categorie = function(cb) {
            Infregister.find(function(err, inf_instance) {
                let res = []
                for (let index = 0; index < inf_instance.length; index++) {
                    if (inf_instance[index].categorie) {
                        let verif = false
                        for (let i = 0; i < res.length; i++) {
                            if (inf_instance[index].categorie == res[i]) {
                                verif = true
                            }
                        }
                        if (verif == false) {
                            res.push(inf_instance[index].categorie)
                        }
                    }
                }
                return cb(err, res)
            })
        }
        // ********************* get all existant influencers categories in the database **************************


    // **********************  change account's influencer image ********************
    Infregister.remoteMethod(
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
    Infregister.account_photo = function(photo, cb) {
            Infregister.findOne({ where: { inf_id: photo.inf_id } }, function(err, br_inst) {
                br_inst.account_image = photo.photo
                br_inst.save()
                return cb(err, br_inst)
            })
        }
        // ********************** end change account's influencer image ********************
        // ********************* api used for the scraping tu update social media informations ******************************
    Infregister.remoteMethod(
        'change_fb', {
            accepts: [
                { arg: 'fb_user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.change_fb = function(fb_user, cb) {
        Infregister.find({ where: { 'fb.username': fb_user.username } }, function(err, inf_inst) {
            if (inf_inst[0]) {
                for (let index = 0; index < inf_inst.length; index++) {
                    inf_inst[index].fb_followers = fb_user.followers
                    inf_inst[index].save()
                }
                return cb(err, inf_inst)
            } else {
                return cb(err, "aucun resultat trouvée avec ce username")
            }
        })
    }
    Infregister.remoteMethod(
        'change_youtube', {
            accepts: [
                { arg: 'youtube_user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.change_youtube = function(youtube_user, cb) {
        Infregister.find({ where: { 'youtube.username': youtube_user.username } }, function(err, inf_inst) {
            if (inf_inst[0]) {
                for (let index = 0; index < inf_inst.length; index++) {
                    inf_inst[index].youtube_followers = youtube_user.followers
                    inf_inst[index].save()
                }
                return cb(err, inf_inst)
            } else {
                return cb(err, "aucun resultat trouvée avec ce username")
            }
        })
    }

    Infregister.remoteMethod(
        'change_insta', {
            accepts: [
                { arg: 'insta_user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.change_insta = function(insta_user, cb) {
            Infregister.find({ where: { 'insta.username': insta_user.username } }, function(err, inf_inst) {
                if (inf_inst[0]) {
                    for (let index = 0; index < inf_inst.length; index++) {
                        inf_inst[index].insta_followers = insta_user.followers
                        inf_inst[index].insta_likes = insta_user.likes
                        inf_inst[index].Ratio_followers_like = (insta_user.followers / insta_user.likes) * 4
                        inf_inst[index].Nombre_de_followers = (insta_user.followers / 4000000) / 2
                        inf_inst[index].save()
                    }
                    return cb(err, inf_inst)
                } else {
                    return cb(err, "aucun resultat trouvée avec ce username")
                }
            })
        }
        // ********************* end api used for the scraping tu update social media informations ******************************

    // ******************* update influencer's "audience" field********************
    Infregister.remoteMethod(
        'audience', {
            accepts: [
                { arg: 'insta_user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.audience = function(insta_user, cb) {
            Infregister.find({ where: { 'insta.username': insta_user.username } }, function(err, inf_inst) {
                if (inf_inst[0]) {
                    for (let index = 0; index < inf_inst.length; index++) {
                        inf_inst[index].audience = insta_user.audience
                        inf_inst[index].save()
                    }
                    return cb(err, inf_inst)
                } else {
                    return cb(err, "aucun resultat trouvée avec ce username")
                }
            })
        }
        // *******************end update influencer's "audience" field********************

    Infregister.remoteMethod(
        'demographie', {
            accepts: [
                { arg: 'insta_user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.demographie = function(insta_user, cb) {
            Infregister.find({ where: { 'insta.username': insta_user.username } }, function(err, inf_inst) {
                if (inf_inst[0]) {
                    for (let index = 0; index < inf_inst.length; index++) {
                        inf_inst[index].demographie = insta_user.demographie
                        inf_inst[index].save()
                    }
                    return cb(err, inf_inst)
                } else {
                    return cb(err, "aucun resultat trouvée avec ce username")
                }
            })
        }
        // **************** calculate 3 months statistiques for influencer ***********************
    Infregister.remoteMethod(
        'trois_mois', {
            accepts: [
                { arg: 'insta_user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.trois_mois = function(insta_user, cb) {
            Infregister.find({ where: { 'insta.username': insta_user.username } }, function(err, inf_inst) {
                let now = new Date()
                if (inf_inst[0]) {
                    for (var index = 0; index < inf_inst.length; index++) {
                        let then = inf_inst[index].trois_mois.last_update
                        let difr = moment(now, "DD/MM/YYYY HH:mm:ss").diff(moment(then, "DD/MM/YYYY HH:mm:ss"), 'months');
                        if (difr >= 3) {
                            inf_inst[index].progression = (((insta_user.trois_mois.followers - inf_inst[index].trois_mois) / inf_inst[index].trois_mois.followers) * 100)
                            inf_inst[index].trois_mois.last_update = new Date()
                            inf_inst[index].save()
                        }
                        if (inf_inst[index].trois_mois.last_update == "") {
                            inf_inst[index].trois_mois.last_update = new Date()
                        }
                        inf_inst[index].trois_mois.followers = insta_user.trois_mois
                        inf_inst[index].save()
                    }
                    return cb(err, inf_inst)
                } else {
                    return cb(err, "aucun resultat trouvée avec ce username")
                }
            })
        }
        // ****************end calculate 3 months statistiques for influencer ***********************
        // ********************* api used for the scraping to update or create accounts using instagram username ******************************
    Infregister.remoteMethod(
        'countries', {
            accepts: [
                { arg: 'insta_user', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.countries = function(insta_user, cb) {
        Infregister.find({ where: { 'insta.username': insta_user.username } }, function(err, inf_inst) {
            if (inf_inst[0]) {
                for (let index = 0; index < inf_inst.length; index++) {
                    inf_inst[index].countries = insta_user.countries
                    inf_inst[index].save()
                }
                return cb(err, inf_inst)
            } else {
                return cb(err, "aucun resultat trouvée avec ce username")
            }
        })
    }
    Infregister.remoteMethod(
        'inscription_insta', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.inscription_insta = function(inf, cb) {
        Infregister.find(function(err, inf_inst) {
            let i = 0
            let verif = false
            while (i < inf_inst.length && !verif) {
                if ((inf_inst[i].insta.username == inf.insta_username) || (inf_inst[i].insta_username == inf.insta_username)) {
                    if (inf.insta_followers > 0) {
                        inf_inst[i].insta_followers = inf.insta_followers
                    }
                    if (inf.photo && inf.photo != "") {
                        inf_inst[i].account_image = inf.photo
                    }
                    if (inf.insta_likes && inf.insta_likes > 0) {
                        inf_inst[i].insta_likes = inf.insta_likes
                    }
                    if (inf.total_post && inf.total_post > 0) {
                        inf_inst[i].total_post = inf.total_post
                    }
                    inf_inst[i].moy_likes = (inf_inst[i].insta_followers / inf_inst[i].insta_likes) * 4
                    inf_inst[i].save()
                    return cb(err, inf_inst[i])
                    verif = true
                }
                i++
            }
            if (!verif) {
                Infregister.create({ inf_name: inf.insta_username, account_image: inf.photo, insta_followers: inf.insta_followers, total_post: inf.total_post, 'insta': { 'username': inf.insta_username } }, function(err, inf_inst) {
                    inf_inst.save()
                    return cb(err, { "not found": inf_inst })
                })
            }
        })
    }
    Infregister.remoteMethod(
        'inscription_fb', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.inscription_fb = function(inf, cb) {
        Infregister.find({ where: { 'fb.username': inf.fb_username } }, function(err, inf_inst) {
            if (inf_inst[0]) {
                for (let index = 0; index < inf_inst.length; index++) {
                    inf_inst[index].fb_followers = inf.fb_followers
                    inf_inst[index].save()
                    return cb(err, inf_inst)
                }
            } else {
                Infregister.create({ 'fb': { 'username': inf.fb_username }, inf_name: inf.fb_username, fb_followers: inf.fb_followers }, function(err, inf_inst) {
                    inf_inst.save()
                    return cb(err, inf_inst)
                })
            }
        })
    }
    Infregister.remoteMethod(
        'inscription_youtube', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.inscription_youtube = function(inf, cb) {
        Infregister.find({ where: { 'youtube.username': inf.youtube_username } }, function(err, inf_inst) {
            if (inf_inst[0]) {
                for (let index = 0; index < inf_inst.length; index++) {
                    inf_inst[index].youtube_followers = inf.youtube_followers
                    inf_inst[index].save()
                    return cb(err, { "update": true })
                }
            } else {
                Infregister.create({ 'youtube': { 'username': inf.youtube_username }, inf_name: inf.youtube_username, youtube_followers: inf.youtube_followers }, function(err, inf_inst) {
                    inf_inst.save()
                    return cb(err, { "creation": true })
                })
            }
        })
    }
    Infregister.remoteMethod(
        'find_inf_by_insta', {
            accepts: [
                { arg: 'insta', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.find_inf_by_insta = function(insta, cb) {
        Infregister.find(function(err, inf_inst) {
            let verif = true
            for (let index = 0; index < inf_inst.length; index++) {
                if (inf_inst[index].insta.username == insta.username) {
                    return cb(err, inf_inst[index].inf_id)
                    verif = false
                }
            }
            if (verif) {
                return cb(err, "not_found")
            }
        })
    }
    Infregister.remoteMethod(
        'find_inf_by_youtube', {
            accepts: [
                { arg: 'yt', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.find_inf_by_youtube = function(yt, cb) {
            Infregister.find(function(err, inf_inst) {
                let verif = true
                for (let index = 0; index < inf_inst.length; index++) {
                    if (inf_inst[index].youtube.username == yt.username) {
                        return cb(err, inf_inst[index].inf_id)
                        verif = false
                    }
                }
                if (verif) {
                    return cb(err, "not_found")
                }
            })
        }
        // *********************end api used for the scraping to update or create accounts using instagram username ******************************
        // ******************* define max and min price for influencer *************************
    Infregister.remoteMethod(
        'prix', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.prix = function(inf, cb) {
            Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
                let max = 0,
                    min = 0
                if (inf_inst) {
                    max = Math.max(inf.prix_insta, inf.prix_fb, inf.prix_stories, inf.prix_musical, inf.prix_youtube, inf.prix_snap)
                    min = Math.min(inf.prix_insta, inf.prix_fb, inf.prix_stories, inf.prix_musical, inf.prix_youtube, inf.prix_snap)
                    inf_inst.prix_min = min
                    inf_inst.prix_max = max
                    inf_inst.save()
                    return cb(err, "sucess")
                } else {
                    return cb(err, "profile non trouvee")
                }
            })
        }
        // *******************end define max and min price for influencer *************************
        //*********************** serch for influencer by filter with paging ***************************
    Infregister.remoteMethod(
        'find_inf4', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.find_inf4 = function(data, cb) {
            let res = []
            let bud_min = 0
            let bud_max = 0
            let ag_min = 0
            let ag_max = 0
            let followers = 0
            let followers_max = 0
            let followers_min = 0
            let sexe = []
            if (data.gender && data.gender[0]) {
                sexe = data.gender
            } else {
                sexe = ["Homme", "Femme", "Life style", ""]
            }
            if (data.followers_max && data.followers_min) {
                followers_max = data.followers_max
                followers_min = data.followers_min
            } else {
                followers_max = 99999999
                followers_min = 0
            }
            if (data.budget_min && data.budget_max) {
                bud_min = data.budget_min
                bud_max = data.budget_max
            } else {
                bud_min = 0
                bud_max = 15000
            }
            if (data.age_min && data.age_max) {
                ag_min = data.age_min
                ag_max = data.age_max
            } else {
                ag_min = 0
                ag_max = 100
            }
            if ((data.lieu[0] && data.categorie[0]) && data.name) {
                Infregister.find({
                        skip: data.skip,
                        limit: 10,
                        "where": {
                            "and": [{ "inf_name": { "regexp": `^${data.name}/i` } },
                                { lieu: { inq: data.lieu } },
                                { gender: { inq: sexe } },
                                { categorie: { inq: data.categorie } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((data.lieu[0] && !data.categorie[0]) && data.name) {
                Infregister.find({
                        skip: data.skip,
                        limit: 10,
                        "where": {
                            "and": [{ "inf_name": { "regexp": `^${data.name}/i` } },
                                { lieu: { inq: data.lieu } },
                                { gender: { inq: sexe } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((!data.lieu[0] && data.categorie[0]) && data.name) {
                Infregister.find({
                        skip: data.skip,
                        limit: 10,
                        "where": {
                            "and": [{ "inf_name": { "regexp": `^${data.name}/i` } },
                                { categorie: { inq: data.categorie } },
                                { gender: { inq: sexe } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((!data.lieu[0] && !data.categorie[0]) && data.name) {
                Infregister.find({
                        skip: data.skip,
                        limit: 10,
                        "where": {
                            "and": [{ "inf_name": { "regexp": `^${data.name}/i` } },
                                { prix_min: { gte: bud_min } },
                                { gender: { inq: sexe } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((data.lieu[0] && data.categorie[0]) && !data.name) {
                Infregister.find({
                        skip: data.skip,
                        limit: 10,
                        "where": {
                            "and": [{ lieu: { inq: data.lieu } },
                                { categorie: { inq: data.categorie } },
                                { gender: { inq: sexe } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((data.lieu[0] && !data.categorie[0]) && !data.name) {
                Infregister.find({
                        skip: data.skip,
                        limit: 10,
                        "where": {
                            "and": [{ lieu: { inq: data.lieu } },
                                { prix_min: { gte: bud_min } },
                                { gender: { inq: sexe } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((!data.lieu[0] && data.categorie[0]) && !data.name) {
                Infregister.find({
                        skip: data.skip,
                        limit: 10,
                        "where": {
                            "and": [
                                { categorie: { inq: data.categorie } },
                                { gender: { inq: sexe } },
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
            if ((!data.lieu[0] && !data.categorie[0]) && !data.name) {
                console.log("here ======>");

                Infregister.find({
                        skip: data.skip,
                        limit: 10,
                        "where": {
                            "and": [
                                { prix_min: { gte: bud_min } },
                                { prix_max: { lte: bud_max } },
                                { gender: { inq: sexe } },
                                { age_min: { gte: ag_min } },
                                { age_max: { lte: ag_max } },
                                { insta_followers: { gte: followers_min } },
                                { insta_followers: { lte: followers_max } }
                            ]
                        }
                    },
                    function(err, inf_instance) {
                        if (inf_instance[0] && !err) {
                            for (let index = 0; index < inf_instance.length; index++) {
                                if ((inf_instance[index].fb.username == "" && data.fb) || (inf_instance[index].insta.username == "" && data.insta) || (inf_instance[index].musical.username == "" && data.musical) || (inf_instance[index].youtube.username == "" && data.youtube)) {} else {
                                    res.push(inf_instance[index])
                                }
                            }
                        }
                        if (res[0] && !err) {
                            return cb(err, res)
                        } else {
                            return cb(err, "désolé aucun profil trouvé avec votre mot clé de recherche")
                        }
                    })
            }
        }
        //***********************end serch for influencer by filter with paging ***************************
        // ********************** update influencer profile **************************************
    Infregister.remoteMethod(
        'update_profile', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_profile = function(inf, cb) {
        Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
            inf_inst.inf_name = inf.inf_name
            inf_inst.langage = inf.langage
            inf_inst.gender = inf.gender
            inf_inst.category = inf.category
            inf_inst.country = inf.country
            inf_inst.city = inf.city
            inf_inst.account_image = inf.account_image
            inf_inst.description = inf.description
            switch (inf.principal) {
                case "instagram":
                    inf_inst.insta.principal = true
                    inf_inst.fb.principal = false
                    inf_inst.snapchat.principal = false
                    inf_inst.youtube.principal = false
                    inf_inst.twitter.principal = false
                    inf_inst.musical.principal = false
                    inf_inst.linkedin.principal = false
                    inf_inst.blog.principal = false
                    break;
                case "fb":
                    inf_inst.fb.principal = true
                    inf_inst.insta.principal = false
                    inf_inst.snapchat.principal = false
                    inf_inst.youtube.principal = false
                    inf_inst.twitter.principal = false
                    inf_inst.musical.principal = false
                    inf_inst.linkedin.principal = false
                    inf_inst.blog.principal = false
                    break;
                case "snapchat":
                    inf_inst.snapchat.principal = true
                    inf_inst.insta.principal = false
                    inf_inst.fb.principal = false
                    inf_inst.youtube.principal = false
                    inf_inst.twitter.principal = false
                    inf_inst.musical.principal = false
                    inf_inst.linkedin.principal = false
                    inf_inst.blog.principal = false
                    break;
                case "youtube":
                    inf_inst.youtube.principal = true
                    inf_inst.insta.principal = false
                    inf_inst.snapchat.principal = false
                    inf_inst.fb.principal = false
                    inf_inst.twitter.principal = false
                    inf_inst.musical.principal = false
                    inf_inst.linkedin.principal = false
                    inf_inst.blog.principal = false
                    break;
                case "twitter":
                    inf_inst.twitter.principal = true
                    inf_inst.insta.principal = false
                    inf_inst.snapchat.principal = false
                    inf_inst.youtube.principal = false
                    inf_inst.fb.principal = false
                    inf_inst.musical.principal = false
                    inf_inst.linkedin.principal = false
                    inf_inst.blog.principal = false
                    break;
                case "musical":
                    inf_inst.musical.principal = true
                    inf_inst.insta.principal = false
                    inf_inst.snapchat.principal = false
                    inf_inst.youtube.principal = false
                    inf_inst.twitter.principal = false
                    inf_inst.fb.principal = false
                    inf_inst.linkedin.principal = false
                    inf_inst.blog.principal = false
                    break;
                case "linkedin":
                    inf_inst.linkedin.principal = true
                    inf_inst.insta.principal = false
                    inf_inst.snapchat.principal = false
                    inf_inst.youtube.principal = false
                    inf_inst.twitter.principal = false
                    inf_inst.musical.principal = false
                    inf_inst.fb.principal = false
                    inf_inst.blog.principal = false
                    break;
                case "blog":
                    inf_inst.blog.principal = true
                    inf_inst.insta.principal = false
                    inf_inst.snapchat.principal = false
                    inf_inst.youtube.principal = false
                    inf_inst.twitter.principal = false
                    inf_inst.musical.principal = false
                    inf_inst.linkedin.principal = false
                    inf_inst.fb.principal = false
                    break;
            }
            inf_inst.save()
            return cb(err, "success")
        })
    }
    Infregister.remoteMethod(
        'update_instagram', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_instagram = function(inf, cb) {
        Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
            if (inf_inst) {
                inf_inst.insta.username = inf.username
                inf_inst.insta.views = inf.views
                inf_inst.insta.followers = inf.followers
                inf_inst.insta.stat = inf.stat
                inf_inst.insta.stories_price = inf.stories_price
                inf_inst.insta.price = inf.price
                inf_inst.save()
                return cb(err, inf_inst)
            }
        })
    }
    Infregister.remoteMethod(
        'update_musical', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_musical = function(inf, cb) {
        Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
            if (inf_inst) {
                inf_inst.musical.username = inf.username
                inf_inst.musical.views = inf.views
                inf_inst.musical.followers = inf.followers
                inf_inst.musical.stat = inf.stat
                inf_inst.musical.price = inf.price
                inf_inst.save()
                return cb(err, "success")
            }
        })
    }
    Infregister.remoteMethod(
        'update_youtube', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_youtube = function(inf, cb) {
        Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
            if (inf_inst) {
                inf_inst.youtube.username = inf.username
                inf_inst.youtube.views = inf.views
                inf_inst.youtube.stat = inf.stat
                inf_inst.youtube.price = inf.price
                inf_inst.save()
                return cb(err, "success")
            }
        })
    }
    Infregister.remoteMethod(
        'update_snapchat', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_snapchat = function(inf, cb) {
        Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
            if (inf_inst) {
                inf_inst.snapchat.username = inf.username
                inf_inst.snapchat.views = inf.views
                inf_inst.snapchat.stat = inf.stat
                inf_inst.snapchat.price = inf.price
                inf_inst.save()
                return cb(err, "success")
            }
        })
    }
    Infregister.remoteMethod(
        'update_fb', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_fb = function(inf, cb) {
        Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
            if (inf_inst) {
                inf_inst.fb.username = inf.username
                inf_inst.fb.views = inf.views
                inf_inst.fb.stat = inf.stat
                inf_inst.fb.price = inf.price
                inf_inst.save()
                return cb(err, inf_inst)
            }
        })
    }
    Infregister.remoteMethod(
        'update_linkedin', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_linkedin = function(inf, cb) {
        Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
            if (inf_inst) {
                inf_inst.linkedin.username = inf.username
                inf_inst.linkedin.views = inf.views
                inf_inst.linkedin.stat = inf.stat
                inf_inst.linkedin.price = inf.price
                inf_inst.save()
                return cb(err, "success")
            }
        })
    }
    Infregister.remoteMethod(
        'update_twitter', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_twitter = function(inf, cb) {
        Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
            if (inf_inst) {
                inf_inst.twitter.username = inf.username
                inf_inst.twitter.views = inf.views
                inf_inst.twitter.stat = inf.stat
                inf_inst.twitter.price = inf.price
                inf_inst.save()
                return cb(err, "success")
            }
        })
    }
    Infregister.remoteMethod(
        'update_blog', {
            accepts: [
                { arg: 'inf', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Infregister.update_blog = function(inf, cb) {
            Infregister.findOne({ where: { inf_id: inf.inf_id } }, function(err, inf_inst) {
                if (inf_inst) {
                    inf_inst.blog.username = inf.username
                    inf_inst.blog.views = inf.views
                    inf_inst.blog.stat = inf.stat
                    inf_inst.blog.price = inf.price
                    inf_inst.save()
                    return cb(err, "success")
                }
            })
        }
        // **********************end update influencer profile **************************************

    // *********************** influenceur: desactivate account ************************
    Infregister.remoteMethod(
        'delete_account', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.delete_account = function(data, cb) {
        var options = {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
        needle.delete('http://localhost:3000/api/inf_registers/' + data.inf_id, options, function(err3, res) {
            needle.delete('http://localhost:3000/api/pylk_accounts/' + data.user_id, options, function(err4, res) {
                if (err4) {
                    return cb(err4)
                }
                return cb(err3, "deleted")
            })
        })
    }

    // in devloppement section
    Infregister.remoteMethod(
        'bring_linkedin', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Infregister.bring_linkedin = function(data, cb) {
        let options = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
            /*  let data = {
                 grant_type: data.grant_type,
                 code: data.code,
                 redirect_uri: data.redirect_uri,
                 client_id: data.client_id,
                 client_secret: data.client_secret
             } */
        needle.post('https://www.linkedin.com/oauth/v2/accessToken', data, options, function(err, response) {
            console.log("response", response);

            /*        options = {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': response.access_token,
                                'host': 'api.linkedin.com'
                            }
                        }
                        needle.get('https://api.linkedin.com/v1/people/', options, function (err, response) {
                            console.log("resp", response);
                            return cb(err, response)
                        })
             */
        })
    }

};