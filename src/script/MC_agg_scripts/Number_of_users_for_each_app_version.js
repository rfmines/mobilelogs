db.events.aggregate(

  // Pipeline
  [
    // Stage 1
    {
      $match: { "created_date": { $gte: ISODate("2016-01-01T00:00:00.000+0000"), 
        					$lte: ISODate("2016-02-01T00:00:00.000+0000") } 
      }
    },

    // Stage 2
    {
      $group: {
      "_id":{"app_v":"$app_version","phn":"$phone_number"},
      "counter_of_events":{$sum:1}
      }
    },

    // Stage 3
    {
      $group: {
      "_id":"$_id.app_v",
      "counter":{$sum:1}
      }
    }
  ],

  // Options
  {
    cursor: {
      batchSize: 50
    },

    allowDiskUse: true
  }

  // Created with 3T MongoChef, the GUI for MongoDB - http://3t.io/mongochef

);
