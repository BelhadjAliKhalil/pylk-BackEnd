module.exports = function(app) {
    const User = app.models.pylk_account;
    const Inf = app.models.inf_register;
    const Br = app.models.brand_register;
    const Agc = app.models.agence_register;
    User.remoteMethod(
        'login2', {
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
    User.login2 = function(email, password, cb) {
        var name = ""
        var id = ""
        var bank_iban = ""
        var photo = ""
        User.findOne({ where: { email: email }, limit: 3 }, function(err, accounts) {
            if (accounts) {
                Br.find(function(err, br_instance) {
                    let verif = false
                    for (let index = 0; index < br_instance.length; index++) {
                        let i = 0;
                        while (i < br_instance[index].accounts_id.length && !verif) {
                            if (br_instance[index].accounts_id[i].user_id == accounts.pylk_account_id) {
                                if (!br_instance[index].confirmed) {
                                    return cb(err, "votre marque n'est pas encore confirmée par Pylk")
                                }
                                verif = true
                            }
                            i++
                        }
                    }
                })
            }
        })
        User.login({
            email: email,
            password: password
        }, 'user', function(err, token) {
            if (err) {
                return cb({
                    title: 'echec de connexion, verifiez votre email et mot de passe ',
                    content: err.message
                });
            }
            return User.find({ where: { email: email }, limit: 3 }, function(err, accounts) {
                if (accounts[0].usertype == "brand") {
                    Br.find(function(err, br_instance) {
                        let verif = false
                        for (let index = 0; index < br_instance.length; index++) {
                            let i = 0;
                            while (i < br_instance[index].accounts_id.length && !verif) {
                                if (br_instance[index].accounts_id[i].user_id == accounts[0].pylk_account_id) {
                                    name = br_instance[index].brand_name
                                    id = br_instance[index].brand_id
                                    photo = br_instance[index].account_image
                                    verif = true
                                }
                                i++
                            }
                            if (verif && !br_instance[index].confirmed) {
                                return cb(err, "votre marque n'est pas encore confirmée par Pylk")
                            }
                        }
                        return cb(err, {
                            account_id: accounts[0].pylk_account_id,
                            email: accounts[0].email,
                            username: accounts[0].name,
                            accessToken: token.id,
                            userType: accounts[0].usertype,
                            brand_id: id,
                            username: name,
                            account_image: photo
                        });
                    })
                }
                console.log("before admin ");

                if (accounts[0].usertype == "admin") {
                    console.log("admin if");
                    console.log(accounts[0]);


                    return cb(err, { userType: "admin" })
                }
                if (accounts[0].usertype == "influenceur") {
                    console.log(accounts[0]);
                    Inf.find(function(err, inf_instance) {
                        for (let index = 0; index < inf_instance.length; index++) {
                            if (inf_instance[index].account_id == accounts[0].pylk_account_id) {
                                name = inf_instance[index].inf_name
                                id = inf_instance[index].inf_id
                                photo = inf_instance[index].account_image
                                    // bank_iban= inf_instance[index].bank_iban    
                            }
                        }
                        return cb(err, {
                            account_id: accounts[0].pylk_account_id,
                            email: email,
                            username: accounts[0].name,
                            accessToken: token.id,
                            userType: accounts[0].usertype,
                            inf_id: id,
                            username: name,
                            account_image: photo
                        });
                    })
                }
                if (accounts[0].usertype == "agence") {
                    console.log(accounts[0]);
                    Agc.find(function(err, agc_instance) {
                        for (let index = 0; index < agc_instance.length; index++) {
                            if (agc_instance[index].account_id == accounts[0].pylk_account_id) {
                                name = agc_instance[index].agency_name
                                id = agc_instance[index].agence_id
                                photo = agc_instance[index].account_image
                            }
                        }
                        return cb(err, {
                            account_id: accounts[0].pylk_account_id,
                            email: email,
                            username: accounts[0].name,
                            accessToken: token.id,
                            userType: accounts[0].usertype,
                            agence_id: id,
                            username: name,
                            account_image: photo
                        });
                    })
                }
            })
        });
    }
}