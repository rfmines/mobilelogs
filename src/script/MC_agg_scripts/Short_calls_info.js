db.events.aggregate(

  // Pipeline
  [
    // Stage 1
    {
      $match: { 
          "event_name" : "RT_CALL_END", 
          "client_date" : {
              "$gte" : ISODate("2016-01-01T00:00:00.000+0000"), 
              "$lte" : ISODate("2016-02-01T00:00:01.000+0000")
          }, 
          "call_duration" : {
              "$lte" : 15
          }
      }
    },

    // Stage 2
    {
      $group: { 
          "_id" : "$phone_number", 
          "counter" : {
              "$sum" : 1
          }, 
          "call_information" : {
              "$push" : {
                  "call_datetime" : "$client_date", 
                  "Call details" : "$event_data"
              }
          }
      }
    }

  ]

  // Created with 3T MongoChef, the GUI for MongoDB - http://3t.io/mongochef

);
