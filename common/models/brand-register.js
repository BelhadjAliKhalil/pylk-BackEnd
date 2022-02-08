'use strict';

module.exports = function(Brandregister) {
    var app = require('../../server/server')
    const moment = require('moment')
    const cron = require('node-cron');
    const User = app.models.pylk_account;
    const Inf = app.models.inf_register;
    const Contr = app.models.contract;
    const agc = app.models.agence_register;
    const comp = app.models.compayn;
    const room = app.models.room;
    const msg = app.models.messages;
    const notif = app.models.notification;
    const needle = require('needle');
    const Stats = app.models.statistiques;
    const stripe = require("stripe")("sk_test_XeDPiHJAHgK60Nq4wNtEcaVU");
    /*  const api_key = 'key-90fd2fc76c0429778d860757aadeda38';
    const domain = 'sandbox9416206b6fdb4b7b9d3a1fa4bf04ee32.mailgun.org';
    const mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });
 */

    // ********** search for a brand by name (like operatior)***************
    Brandregister.remoteMethod(
        'find_brand', {
            accepts: [
                { arg: 'name', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.find_brand = function(name, cb) {
            let res = []
            Brandregister.find({
                    where: {
                        brand_name: { "regexp": `^${name}/i` },
                    }
                },
                function(err, brand_instance) {
                    let res = []
                    if (brand_instance && !err) {
                        for (let index = 0; index < brand_instance.length; index++) {
                            res.push(brand_instance[index])
                        }
                    }
                    return cb(err, res)
                })
        }
        // ***************** search for brand by id *****************************************************
    Brandregister.remoteMethod(
        'get_single_brand', {
            accepts: [
                { arg: 'brand_id', type: 'string', 'http': { source: 'query' } },
            ],
            http: { path: '/get_single_brand', verb: 'get' },
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.get_single_brand = function(brand_id, cb) {
            Brandregister.find({ where: { brand_id: brand_id } }, function(err, brand_instance) {
                if (brand_instance[0]) {
                    return cb(err, brand_instance[0]);
                } else {
                    return cb(err, {
                        title: "no match found with this id"
                    })
                }
            })
        }
        // ***************** end search for brand by id *****************************************************

    // ***************** add contract to brand's contract list **************************************
    Brandregister.remoteMethod(
        'add_contact', {
            accepts: [
                { arg: 'contract_id', type: 'string', 'http': { source: 'query' } },
                { arg: 'brand_id', type: 'string', 'http': { source: 'query' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.add_contact = function(contract_id, brand_id, cb) {
            Brandregister.find({ where: { brand_id: brand_id } }, function(err, brand_instance) {
                brand_instance[0].contract_list.push({ "contract_id": contract_id })
                brand_instance[0].save()
                return cb(err, brand_instance);
            });
        }
        // ***************** add contract to brand's contract list **************************************

    // **********************add photo to brand's gallery **************************
    Brandregister.remoteMethod(
        'add_photo', {
            accepts: [
                { arg: 'photo', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.add_photo = function(photo, cb) {
            Brandregister.findOne({ where: { brand_id: photo.brand_id } }, function(err, br_inst) {
                br_inst.photos.push({ "photo": photo.photo, "legende": photo.legende })
                br_inst.save()
                return cb(err, br_inst)
            })
        }
        // **********************end add photo to brand's gallery **************************
        // ********************** change account's brand image ********************
    Brandregister.remoteMethod(
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
    Brandregister.account_photo = function(photo, cb) {
            Brandregister.findOne({ where: { brand_id: photo.brand_id } }, function(err, br_inst) {
                br_inst.account_image = photo.photo
                br_inst.save()
                return cb(err, br_inst)
            })
        }
        // ********************** end change account's brand image ********************


    // ********************* return brand's photos ******************************
    Brandregister.remoteMethod(
        'get_photos', {
            accepts: [
                { arg: 'brand_id', type: 'string', 'http': { source: 'query' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.get_photos = function(brand_id, cb) {
            Brandregister.findOne({ where: { brand_id: brand_id } }, function(err, br_inst) {
                return cb(err, { "brand_id": br_inst.brand_id, "account_image": br_inst.account_image, "photos": br_inst.photos })
            })
        }
        // ********************* return brand's photos ******************************
        // ********************* remove photo from brand's gallery ******************************
    Brandregister.remoteMethod(
        'remove_photo', {
            accepts: [
                { arg: 'brand', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.remove_photo = function(brand, cb) {
            Brandregister.findOne({ where: { brand_id: brand.brand_id } }, function(err, br_inst) {
                let verif = false
                let i = 0
                if (!brand.legende) {
                    brand.legende = ""
                }
                while (verif == false && i < br_inst.photos.length) {
                    if ((brand.photo == br_inst.photos[i].photo) && (brand.legende == br_inst.photos[i].legende)) {
                        br_inst.photos.splice(i, 1)
                        br_inst.save()
                        verif = true
                    }
                    i++
                }
                return cb(err, br_inst)
            })
        }
        // ********************* remove photo from brand's gallery ******************************
        // ********************* edit photo description ******************************
    Brandregister.remoteMethod(
        'modifier_legende', {
            accepts: [
                { arg: 'brand', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.modifier_legende = function(brand, cb) {
            Brandregister.findOne({ where: { brand_id: brand.brand_id } }, function(err, br_inst) {
                let verif = false
                let i = 0
                while (verif == false && i < br_inst.photos.length - 1) {
                    if ((brand.photo == br_inst.photos[i].photo) && (brand.legende == br_inst.photos[i].old_legende)) {
                        br_inst.photos[i].legende = brand.new_legende
                        verif = true
                    }
                    i++
                }
                return cb(err, br_inst)
            })
        }
        // *********************end edit photo description ***************************************************

    // ******************** report brand *************************************
    Brandregister.remoteMethod(
        'signaler_brand', {
            accepts: [
                { arg: 'description', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.signaler_brand = function(description, cb) {
            //Brandregister.findOne({ where: { brand_id: brand_id } }, function (err, br_inst) {

            Brandregister.app.models.contract.findOne({ where: { contract_id: description.contract_id } }, function(err1, contr_inst) {
                Brandregister.app.models.messages.create({
                    room_id: contr_inst.room_id,
                    text: "litige réclamé",
                    text2: "litigeRéclamé",
                    contract_id: description.contract_id,
                    negociated: true,
                    sender: "pylk",
                    receiver: contr_inst.inf_id,
                    sent_at: new Date()
                }, function(err, msg_inst) {
                    if (err) {
                        return cb(err, "success")
                    }
                })
            })
            var data = {
                from: 'Pylk <postmaster@sandbox9416206b6fdb4b7b9d3a1fa4bf04ee32.mailgun.org>',
                to: 'azza.garsaa@gmail.com',
                subject: 'Signalement',
                text: description.description
            };
            /* mailgun.messages().send(data, function(error, body) {
                return cb(error, "email sent")
                    // });
            }) */
        }
        // ******************** end report brand *************************************

    // ********************* registration for brand **********************************
    Brandregister.remoteMethod(
        'inscription', {
            accepts: [
                { arg: 'brand', type: 'object', 'http': { source: 'body' } }
                //brand:{account_id,username,brand_name,type,categorie,country,website,description,adress,bank_fname,bank_lname,bank_lname,bank_adress,bank_iban}
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Brandregister.inscription = function(brand, cb) {
            Brandregister.find(function(err, br_inst) {
                var index = 0;
                let verif = true
                while (index < br_inst.length && verif) {
                    if (br_inst[index].brand_name.toUpperCase() == brand.brand_name.toUpperCase()) {
                        verif = false
                        return cb(err, { "exist": true, "brand": br_inst[index] })
                    }
                    index++
                }
                if (verif) {
                    Brandregister.create({ brand_name: brand.brand_name, accounts_id: [{ "user_id": brand.account_id, "role": "Admin", "email": brand.email, "username": brand.username }] }, function(err, br_inst) {
                        return cb(err, { "exist": false, "brand": br_inst })
                    })
                }
            })
        }
        // *********************end registration for brand **********************************
        // ********************* brand accept to add new user **********************************
    Brandregister.remoteMethod(
        'confirm_account', {
            accepts: [
                { arg: 'brand', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Brandregister.confirm_account = function(brand, cb) {
            Brandregister.findOne({ where: { brand_id: brand.brand_id } }, function(err, br_inst) {
                Brandregister.app.models.pylk_account.findOne({ where: { pylk_account_id: brand.confirmed_user_id } }, function(err, usr_inst) {
                    br_inst.accounts_id.push({ user_id: brand.confirmed_user_id, role: brand.role, email: usr_inst.email, username: usr_inst.username })
                    br_inst.save()
                    Brandregister.app.models.notification.findOne({ where: { notif_id: brand.notif_id } }, function(err, notif_inst) {
                        notif_inst.seen = true
                        notif_inst.save()
                        return cb(err, br_inst)
                    })
                })
            })
        }
        // ********************* brand accept to add new user **********************************
        // ********************* return non confirmed brand's accounts ******************
    Brandregister.remoteMethod(
        'get_non_confirmed', {
            http: { path: '/get_non_confirmed', verb: 'get' },
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.get_non_confirmed = function(cb) {
            Brandregister.find({ where: { confirmed: false } }, function(err, br_inst) {
                if (br_inst[0]) {
                    return cb(err, br_inst)
                } else {
                    return cb(err, "no non confirmed brands found")
                }
            })
        }
        // ********************* return non confirmed brand's accounts ******************
        // ********************* confirm brand to register admin side ******************
    Brandregister.remoteMethod(
        'confirm_brand', {
            accepts: [
                { arg: 'brand', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Brandregister.confirm_brand = function(brand, cb) {
            Brandregister.findOne({ where: { brand_id: brand.brand_id } }, function(err, br_inst) {
                br_inst.confirmed = true
                br_inst.save()
                return cb(err, "success")
            })
        }
        // ********************* endconfirm brand to register admin side ******************

    // ******************** change brands'user role *******************
    Brandregister.remoteMethod(
        'change_role', {
            accepts: [
                { arg: 'brand', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Brandregister.change_role = function(brand, cb) {
            Brandregister.findOne({ where: { brand_id: brand.brand_id } }, function(err, br_inst) {
                let index = 0,
                    verif = false
                while (index < br_inst.accounts_id.length && !verif) {
                    if (br_inst.accounts_id[index].user_id == brand.user_id) {
                        if (brand.admin) { br_inst.accounts_id[index].role = "Admin" }
                        if (brand.normal) { br_inst.accounts_id[index].role = "Normal user" }
                        verif = true
                    }
                    index++
                }
                return cb(err, br_inst.accounts_id)
            })
        }
        // ********************end change brands'user role *******************
        // ******************** delete user from brand account *******************
    Brandregister.remoteMethod(
        'fire_user', {
            accepts: [
                { arg: 'brand', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Brandregister.fire_user = function(brand, cb) {
            Brandregister.findOne({ where: { brand_id: brand.brand_id } }, function(err, br_inst) {
                let index = 0
                verif = false
                while (index < br_inst.accounts_id.length && !verif) {
                    if (br_inst.accounts_id[index].user_id == brand.user_id) {
                        br_inst.accounts_id.splice(index, 1)
                        br_inst.save()
                    }
                    index++
                }
                return cb(err, br_inst.accounts_id)
            })
        }
        // ********************end delete user from brand account *******************
    Brandregister.remoteMethod(
        'scrapper_create', {
            accepts: [
                { arg: 'brand', type: 'object', 'http': { source: 'body' } }
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        })
    Brandregister.scrapper_create = function(brand, cb) {
        Brandregister.find(function(err, brand_instance) {
            let index = 0,
                verif = false
            while (index < brand_instance.length && !verif) {
                if (brand_instance[index].brand_name == brand.brand_name) {
                    verif = true
                    return cb(err, "brand with same name found")
                }
                index++
            }
            if (!verif) {
                Brandregister.create({ brand_name: brand.brand_name, account_image: brand.account_image, website: brand.website, description: brand.description, adress: brand.adress })
                return cb(err, "done with creation")
            }
        })
    }

    // ********************** change email *******************************
    Brandregister.remoteMethod(
        'change_email', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.change_email = function(data, cb) {
            User.findOne({ where: { pylk_account_id: data.user_id } }, function(err, account_inst) {
                if (err) {
                    return cb(err)
                }
                if (account_inst) {
                    account_inst.email = data.email
                    account_inst.save()
                    Brandregister.findOne({ where: { brand_id: data.brand_id } }, function(err1, br_inst) {
                        let index = 0
                        let found = false
                        while (index < br_inst.accounts_id.length && !found) {
                            if (br_inst.accounts_id[index].user_id == data.user_id) {
                                br_inst.accounts_id[index].email = data.email
                                br_inst.save()
                                found = true
                            }
                            index++
                        }
                        return cb(err1, "success")
                    })
                }
            })
        }
        // ********************** end change email *******************************

    // *********************** brand: desactivate account **********************    
    Brandregister.remoteMethod(
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
    Brandregister.delete_account = function(data, cb) {
            var options = {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
            needle.delete('http://localhost:3000/api/brand_registers/' + data.brand_id, options, function(err3, res) {
                Brandregister.findOne({ where: { brand_id: brand_id } }, function(err, br_inst) {
                    for (let index = 0; index < br_inst.accounts_id.length; index++) {
                        needle.delete('http://localhost:3000/api/pylk_accounts/' + br_inst.accounts_id[index], options, function(err4, res) {
                            if (err4) {
                                return cb(err4)
                            }
                            return cb(err3, "deleted")
                        })
                    }
                })
            })
        }
        // ************* Administration: get lastest brands registered ***************
    Brandregister.remoteMethod(
        'lastest_brands', {
            http: { path: '/lastest_brands', verb: 'get' },
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.lastest_brands = function(cb) {
        let res = []
        Brandregister.find(function(err, br_inst) {
            if (br_inst.length > 10) {
                for (let index = br_inst.length - 10; index < br_inst.length; index++) {
                    res.push(br_inst[index])
                }
            } else {
                res.push(br_inst)

            }


            return cb(err, res)
        })
    }

    // ************** update brand's payment informations *******************
    Brandregister.remoteMethod(
        'paiment_informations', {
            accepts: [
                { arg: 'data', type: 'object', 'http': { source: 'body' } },
            ],
            returns: {
                arg: 'response',
                type: 'string'
            }
        }
    );
    Brandregister.paiment_informations = function(data, cb) {
            Brandregister.findOne({ where: { brand_id: data.brand_id } }, function(err, br_inst) {
                if (data.num_carte) {
                    if (Number.isInteger(parseInt(data.num_carte, 10))) {
                        br_inst.num_carte = data.num_carte
                    } else {
                        return cb(err, "Le numéro de la carte n'est pas valide")
                    }
                }
                if (data.bank_zip) {
                    if (Number.isInteger(parseInt(data.bank_zip, 10))) {
                        br_inst.bank_zip = data.bank_zip
                    } else {
                        console.log(data.bank_zip);
                        return cb(err, "Le code postal n'est pas valide")
                    }
                }
                if (data.account_image) {
                    br_inst.account_image = data.account_image
                }
                if (data.bank_fname) {
                    br_inst.bank_fname = data.bank_fname
                }
                if (data.banklname) {
                    br_inst.banklname = data.banklname
                }
                if (data.bank_adress) {
                    br_inst.bank_adress = data.bank_adress
                }
                if (data.bank_zip) {
                    br_inst.bank_zip = data.bank_zip
                }
                if (data.bank_country) {
                    br_inst.bank_country = data.bank_country
                }
                if (data.bank_iban) {
                    br_inst.bank_iban = data.bank_iban
                }
                if (data.type_carte) {
                    br_inst.type_carte = data.type_carte
                }
                if (data.num_carte) {
                    br_inst.num_carte = data.num_carte
                }
                if (data.nom_carte) {
                    br_inst.nom_carte = data.nom_carte
                }
                if (data.date_exp) {
                    br_inst.date_exp = data.date_exp
                }
                if (data.ccv) {
                    br_inst.ccv = data.ccv
                }
                br_inst.save()
                return cb(err, "Enregistré")
            })
        }
        // ************** update brand's payment informations *******************
};