const express = require('express');
const route = express.Router();
const bodyParser = require('body-parser');



// middleware server 열림 확인
route.get('/', function(req, res){
    res.send("Test page");
});


// rest study (보안상 안좋아서 사용하지 않음)
/*
route.route('/test')
  .post(test.createUser)
  .get(test.readUser)
  .put(test.updateUser)
  .delete(test.deleteUser)
*/

route.get('/get', function(req, res){
    console.log(req.body);
    res.send("get방식");
});

route.get('/post', function(req, res){
    console.log(req.body);
    res.send("post방식");
});


// 데이터 업데이트& 삭제
route.route('/body/:id')
    .get(function(req, res){
        console.log(req);
        res.send("확인중");
    });

module.exports = route;



