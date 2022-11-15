var amqp = require('amqplib/callback_api');


function sendMessageRabbit(_id, _node, _rtspUri) {

    var id = _id || 'req01';
    var node = _node || 'etri:041';
    var rtspUri = _rtspUri;

    var rabbit_id = 'admin'; // properties 사용
    var rabbit_pw = 'admin'; // properties 사용
    var rabbit_ip = 'localhost'; // properties 사용
    var rabbit_port = '5672'; // properties 사용

    if(!_rtspUri) {
        return 'error';
    } else {
        try {
            amqp.connect('amqp://' + rabbit_id + ':' + rabbit_pw +'@' + rabbit_ip + ':' + rabbit_port, function(err, connection){
                if(err) {console.log(err);}
                else  {
                  connection.createChannel(function(error1, channel) {
                    if (error1) {
                      throw error1;
                    }
                    var queue = 'track_requests';
                    var msg = {
                      "id": id,
                      "node": node,
                      "progress_report": {
                        "interval_seconds": 1
                      },
                      "rtsp_uri": rtspUri
                    };
                    channel.assertQueue(queue, {
                      durable: false
                    });
                
                    channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
                    
                    // TODO : end to connect
                  }); 
                }
              });
        } catch (e) {
            console.log('rabbitmq_modules error : ', e);
        }
        
    }
}

module.exports = (_id, _node, _rtspUri) => sendMessageRabbit(_id, _node, _rtspUri);