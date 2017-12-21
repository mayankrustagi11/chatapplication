const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//Connection URL
const url = "mongodb://localhost:27017";
const dbName = 'chatapp';

//Connect to MongoDB server
mongo.connect(url, function(err,user){

    if(err) throw err;
    console.log('Connected Successfully...');

    //Connect to Socket.io
    client.on('connection',function(socket){

        const db = user.db(dbName);
    /*    db.createCollection('chats',function(err,res){
            if(err) throw err;
        });
    */
        const chat = db.collection('chats');

        //Send Status
         let sendStatus = function(s){
            socket.emit('status',s);
        };

        //Get Chat From Collection
    chat.find().limit(100).sort({_id:1}).toArray( function(err,res){
            if(err) throw err;

            //Emit Messages
            socket.emit('output',res);
        });

        //Handle input events
        socket.on('input',function(data){
           let name = data.name;
           let message = data.message;

           //Check for name and message
            if(name === '' || message === ''){
                //Send status
                sendStatus('Please enter a name and a message');
            }

            else {
                //Insert message
                chat.insertOne({name: name, message: message}, function(){
                   client.emit('output',data);

                   //Send status object
                    sendStatus({
                        message: 'Message Sent',
                        clear: true
                    });
                });
            }
        });

        //Handle Clear
        socket.on('clear',function(){
            //Remove all chats from collection
            chat.deleteMany({},function(){
                //Emit cleared
                socket.emit('cleared');
            });
        });

    });

});