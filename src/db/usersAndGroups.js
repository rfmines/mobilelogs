let mongoose = require('mongoose');
let db = require('./connection').db;

let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

let userSchema = Schema({
    username: String,
    password: String,
    email: String,
    role: String,
    last_login: Date,
    auth_token: String,
    groups: {type: Array, "default": []} //array to groupid
});

let groupSchema = Schema({
    ownerid: ObjectId, //users
    members: {type: Array, "default": []}, //array to userid
    name: String //group name
});

let LogUser = db.model('User', userSchema);
let LogGroup = db.model('Group', groupSchema);

module.exports = {
    findOneUser: function (query, cb) {
        return new Promise(function (resolve, reject) {
            LogUser.findOne(query, function (err, document) {
                if (err) {
                    reject(err);
                    if (cb) {
                        cb(err, null)
                    }
                } else {
                    resolve(document);
                    if (cb) {
                        cb(null, document);
                    }
                }
            })
        })
    },
    updateUser: function (query, updateParams, cb) {
        return new Promise(function (resolve, reject) {
            LogUser.update(query, updateParams, {multi: false}, function (err, updateResult) {
                if (err) {
                    if (cb) {
                        cb(err, null)
                    }
                    reject(err);
                } else {
                    if (cb) {
                        cb(null, updateResult);
                    }
                    resolve(updateResult);
                }
            })
        })
    },
    createUser: function (userObj, cb) {
        return new Promise(function (resolve, reject) {
            let newUser = new LogUser(userObj);
            newUser.save(function (err, item) {
                if (err) {
                    if (cb) {
                        cb(err, null);
                    }
                    reject(err);
                    return;
                }
                if(cb){
                    cb(null,item)
                }
                resolve(item);
            });
        });

    },
    deleteUser: function (query, cb) {
        return new Promise(function (resolve, reject) {
            LogUser.remove(query,function (err, item) {
                if (err) {
                    if (cb) {
                        cb(err, null);
                    }
                    reject(err);
                    return;
                }
                if(cb){
                    cb(null,item)
                }
                resolve(item);
            });
        });

    },
    updateGroup : function (query,params) {
        return new Promise(function (resolve, reject) {
            LogGroup.update(query, params, {upsert: true}, function (err, updateResult) {
                if (err) {
                    if (cb) {
                        cb(err, null)
                    }
                    reject(err);
                } else {
                    if (cb) {
                        cb(null, updateResult);
                    }
                    resolve(updateResult);
                }
            })
        })
    },
    findOneGroup: function (query, cb) {
        return new Promise(function (resolve, reject) {
            LogGroup.findOne(query, function (err, document) {
                if (err) {
                    reject(err);
                    if (cb) {
                        cb(err, null)
                    }
                } else {
                    resolve(document);
                    if (cb) {
                        cb(null, document);
                    }
                }
            })
        })
    },
};

