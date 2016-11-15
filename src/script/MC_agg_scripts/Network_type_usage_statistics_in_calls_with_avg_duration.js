db.events.aggregate(

  // Pipeline
  [
    // Stage 1
    {
      $match: { "created_date": { $gte: ISODate("2016-01-01T00:00:00.000+0000"), 
        					$lte: ISODate("2016-02-01T00:00:00.000+0000") }, 
        "event_name": "RT_CALL_END" 
      }
    },

    // Stage 2
    {
      $unwind: "$event_data"
    },

    // Stage 3
    {
      $match: {
      "event_data.label":"Network status"
      }
    },

    // Stage 4
    {
      $group: {
      "_id":{"ooma_account":"$phone_number","network_type":"$event_data.value"},
      "avg_duration":{$avg:"$call_duration"},
      "Counter":{$sum:1}
      
      }
    },

    // Stage 5
    {
      $project: {
      "_id":"$_id.ooma_account",
      "Network_type":"$_id.network_type",
      "avg_duration":"$avg_duration",
      "Number_of_calls":"$Counter"
      }
    },

    // Stage 6
    {
      $group: {
      "_id":"$_id",
      "Calls_statistics":{$push:{"Network_type":"$Network_type",
      							"Avg_duration":"$avg_duration",
      							"Number_of_calls":"$Number_of_calls"}},
      							
      "Calls_total":{$sum:"$Number_of_calls"}
      }
    }

  ]

  // Created with 3T MongoChef, the GUI for MongoDB - http://3t.io/mongochef

);
