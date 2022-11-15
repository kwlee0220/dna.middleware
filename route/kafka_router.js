//var kafka = require('kafka-node');
const router = require("express").Router();
const ws = require('ws');
const app = require('../server');
const { Pool } = require('pg');

const port = 3031;
const websocketPort = 3030;

var kafka = require('kafka-node');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'basic',
  password: 'postgres',
  port: 5432,
});

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

pool.connect(err => {
  if (err) {
    console.log('Failed to connect db ' + err)
  } else {
    console.log('Connect to db done!')
  }
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

function initConsumer() {
    try {

      if(!client) {        
        const basicProp = PropsReader('../properties/basicProxy.properties');
        initKafkaClient('node-tracks', basicProp.get("DNA_MW_KAFKA_SERVERS"));
      }
      if(!consumer) {
        
      }
      console.log('consumer on');
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
        // try {
        //   const sql = 'INSERT INTO TB_CENSOR_DET_DATA(CENSOR_DATE, CENSOR_NODE, CENSOR_LUID, CENSOR_STATE, CENSOR_LOCATION, CENSOR_FRAME_INDEX, CENSOR_TS, CENSOR_WORLD_COORD, CENSOR_DISTANSE) VALUES '
        //   + '(TO_CHAR(NOW(), '
        //   + '\'YYYYMMDDHH24MISS\'), \'' 
        //   + val.node + '\', \'' 
        //   + val.luid + '\', \'' 
        //   + val.state + '\', \'' 
        //   + val.location.join(",") + '\', \'' 
        //   + val.frame_index +'\', \'' 
        //   + val.ts + '\', '
        //   + (val.world_coord?'ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(\'{"type":"POINT","coordinates":[' + val.world_coord.join(", ") +']}\'),3857),4326), \'':'null, ')
        //   + val.distance +'\')';
          
        //   pool.query(sql, (err, res) => {
        //     if(err) {
        //       console.log(err.stack);
        //     } else {
        //       console.log(res.rows[0]);
        //     }
        //   });
        // } catch (e) {
        //   console.log('insert query error');
        //   console.log(e);
        // }
        
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

  console.log("linked initKafkaClient ... >> "+ "\r\ntopic: " + _topic + "\r\nhost: " + _host);
  res.send("linked initKafkaClient ... >> "+ "\r\ntopic: " + _topic + "\r\nhost: " + _host);

  initKafkaClient(_topic, _host)

});
module.exports = router;
