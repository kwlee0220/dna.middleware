const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

// router
const router = require('./route/router');
const restAPI_router = require('./route/cctvRestApi_router');   // cctvRestdata_Router
const kafka_router = require('./route/kafka_router');   // kafka_Router


// post방식 데이터 전송 파싱을 위해 처리
app.use(bodyParser.json());    // 전송받은 데이터 json 처리
app.use(bodyParser.urlencoded({extended: true}));  
/* extended : 전송받은 데이터 타입선정
 - true : any Type (boolean, int....)
 - false : String, Object
*/ 
app.use(router); 
app.use(restAPI_router); 
app.use(kafka_router); 


console.log(port);
// 서버 실행&에러 응답 (IPv6 > IPv4 치환)
app.listen(port, '0.0.0.0', err=>{
    if(err) console.log(err)
    else console.log('서버가 가동되었습니다.')
});

module.exports = app;