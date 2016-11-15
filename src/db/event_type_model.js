"use strict";
const mongoose = require('mongoose');
const log4js = require('log4js');
const logger = log4js.getLogger('applog');
//var Promise = require('promise');
const db = mongoose.connection;
const env = process.env.NODE_ENV || 'production';
const config = require('./config')[env];
const db_config = config.database;
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const eventTypeDictionarySchema = new Schema({
  id: String,
  name: String
});

const EventTypes = mongoose.model('EventTypes', eventTypeDictionarySchema);

module.exports = {
  get: function(id) {
    return new Promise( (resolve, reject) => {
      EventTypes.findById(id,  (err, item) =>  {
        if (err) reject( err );
        resolve( item );
      })
    });
  },
  remove: function (id) {
    return new Promise( (resolve, reject) => {
      EventTypes.remove({_id: id},  (err) => {
        if (err) reject( err );
        resolve( 'ok' );
      });
    });
  },

  list: function (query) {
    if (query == null) { query = {}; }
    return new Promise( (resolve, reject) => {
      EventTypes.find(query,  (err, items) => {
        if (err) reject( err );
        resolve( items );
      });
    });
  },

  create: function(params) {
    return new Promise( (resolve, reject) => {
      let EventType = new EventTypes(params);
      EventType.save( (err, item) => {
        if (err) {
          reject( err );
          return;
        }
        resolve( item );
      });
    });
  },

  update: function(id, params) {
    return new Promise( (resolve, reject) =>  {
      let EventType = new EventTypes(params);
      EventTypes.findById(id, (err, item) => {
        console.log(item);
        //for (let id of params) {
        for (let id in params) {
            item[id] = params[id]
          }
        item.save((err, item) => {
          if (err) {
            reject( err );
            return;
          }
          resolve( item );
        });
      });
    });
  }
};

