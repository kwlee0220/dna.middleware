//var kafka = require('kafka-node');
const router = require("express").Router();
const ws = require('ws');
const app = require('../server');

const port = 3031;
const websocketPort = 3030;

var kafka = require('kafka-node');
const PropsReader = require("properties-reader");
var http = require("http").createServer(app);
var io = require('socket.io')(http, { cors: { origin: "*" } });

const wss = new ws.Server({port:websocketPort}, () => {
  console.log('서버 시작');
});

var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.KafkaClient;
var consumer;
var ws_list = [];
var states = ['Tentative','Deleted'];

var frame_index = {};

http.listen(port, () => {
  console.log("listening on *:" + port);
});

io.on('connection', function (socket) {
  if(!consumer) initConsumer();

  console.log(`${socket.id} 연결 되었습니다.`);
  socket.emit('msg', `${socket.id} 연결 되었습니다.`);
  
  socket.on('disconnect', function(){
    console.log(`${socket.id} 연결이 해제 되었습니다.`);
  });
});

wss.on('connection', function connection(ws) {
  if(!consumer) initConsumer();
});

var topics = null;
var options= null;
var client = null;

function initKafkaClient(_topic, _host) {
  var topic = _topic||'node-tracks';
  client = new Client({ kafkaHost: _host||'127.0.0.1:9091,127.0.0.1:9092,127.0.0.1:9093' });
  topics = [{ topic: topic, partition: 0 }];
  options = { autoCommit: true, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };
  var offset = new Offset(client);
  offset.fetch([{topic: topic, partition: 0, time: Date.now(), maxNum: 1 }], function(err, data) { console.log(data);});
}
const basicProp = PropsReader('./properties/basicProxy.properties');
function initConsumer() {
    try {

      if(!client) {
        initKafkaClient('node-tracks', process.env.DNA_MW_KAFKA_SERVERS||basicProp.get("DNA_MW_KAFKA_SERVERS"));
      }
      consumer = new Consumer(client, topics, options);
      consumer.on('message', function (message) {
        var val = JSON.parse(message.value);
        if(states.includes(val.state) || frame_index == 0 || frame_index[val.luid] < val.frame_index) {
          
          // io socket list
          io.sockets.sockets.forEach(function(value, key) {
            if(io.sockets.sockets.get(key).connected) io.sockets.sockets.get(key).emit('msg', val);
          });

          wss.clients.forEach(function each(client) {
            if(client.readyState === ws.OPEN) {
              console.log('send');
              client.send(JSON.stringify(val));
            }
          });
                    
          frame_index[val.luid] = val.frame_index;
        }
        
      });    
      consumer.on('error', function (err) {
        console.log('error', err);
      });
      
    } catch (e) {
      console.log(e);    
    }
      
}

// kafka topic 저장 시 실행
router.post('/rest/kafka', function(req, res){
  let _topic = req.query.topic;
  let _host = req.query.host;
  res.send("linked initKafkaClient ... >> "+ "\r\ntopic: " + _topic + "\r\nhost: " + _host);

  initKafkaClient(_topic, _host)

});
module.exports = router;
