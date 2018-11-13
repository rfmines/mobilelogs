/**
 * @brief Mobile Application logger - server side
 * @author: Dmitry Kudryavtsev (dkudryav@ooma.com)
 */
deployment = {}
deployment.deployment_start = function(){
    try {
        db = connect("localhost:27017/express")
	    db.createCollection('session');
        print('Session collection created in express DB')
        db.createUser({"user":"express","pwd":"ooma123","customData":{"Description":"JS Express user"},"roles":[{role:"readWrite",db:"express"}]});
        print('Express user created')
        db2 = connect("localhost:27017/applog")
        db2.createCollection('events')
        db2.createCollection('logdatas')
        print('Collections events and logdatas created in applogDB')
        db2.events.createIndex({"devid":1,"client_date":-1,"db_id":1},{unique:true});
		db2.events.createIndex({"phone_number":1});
		db2.events.createIndex({"event_name":1,"client_date":1});
		
        db2.logdatas.createIndex({"client_date":-1,"devid":1,"db_id":1},{unique:true});
        db2.events.createIndex({"phone_number":1});
        print('Unique Indexes created')
        db2.createUser({"user":"applog","pwd":"ooma123","customData":{"Description":"Mangoose user"},"roles":[]})
        db2.runCommand({createRole:"applogRole",
            privileges: [
              { resource: { db: "applog" , collection: "authlimitations" },
            actions: [ "find","update","remove","insert","createCollection"] },

               { resource: { db: "applog" , collection: "validtokens" },
                    actions: [ "find","insert","createCollection"] },

                { resource: { db: "applog", collection: "events" },
                    actions: [ "insert","createCollection" ] },

                { resource: { db: "applog", collection: "logdatas" },
                    actions: [ "insert","createCollection" ] },

                { resource: { db: "applog", collection: "logsessions" },
                    actions: [ "insert","createCollection" ] },

                { resource: { db: "applog" , collection: "groups" },
                    actions: [ "find","update","remove","insert","createCollection"] },

                { resource: { db: "applog" , collection: "userapps" },
                    actions: [ "find","update","remove","insert","createCollection"] },

                { resource: { db: "applog" , collection: "users" },
                    actions: [ "find","update","remove","insert","createCollection"] }],

            roles:[]})
        db2.runCommand({grantRolesToUser: "applog", roles:[{role:"applogRole",db:"applog"}]})
        print('Applog user created with applog role')
        db3 = connect("localhost:27017/notification")
	db3.createCollection("diskspace");
        db3.createUser({"user":"notif","pwd":"ooma123","customData":{"Description":"User for notification"},"roles":[{role:"readWrite",db:"notification"}]})
       print('Notif user created')
}
catch (e) {
	print('Exception :',e)
}}
deployment.create_admin = function(admin_username,admin_pass){
db4 = connect("localhost:27017/admin")
db4.createUser({"user":admin_username,"pwd":admin_pass,"customData":{"Description":"DBA account"},"roles":[{role:"root",db:"admin"}]})
}