/** BasicProxy router */
const express = require('express');
const route = express.Router();
const kafka_router = require("../route/kafka_router");
const cctvRestAPI_cont = require('../controller/cctvRestApi_controller');
const cctvCalendarAPI_cont = require('../controller/cctvCalendarApi_controller');
const cctvTimelineAPI_cont = require('../controller/cctvTimelineApi_controller');
const cctvReplayAPI_cont = require('../controller/cctvReplayApi_controller');   
const cctvLiveApi_cont = require('../controller/cctvLiveApi_controller');        
const cctvPreviewApi_cont = require("../controller/cctvPreviewApi_controller");


const requestIp = require('request-ip'); // 접속한 클라이언트 ip가져오는 용도
const PropsReader = require("properties-reader");
const { ResourcePatternTypes } = require('kafkajs');
const basicProp = PropsReader('properties/basicProxy.properties');



  



// RestAPI server 열림 확인
route.get('/rest', function(req, res){
    console.log("RestAPI Server Open");
    res.send("RestAPI Server Open");
});


// test용
route.route('/rest/cctv')
    .post(cctvRestAPI_cont.createData)      // Creat Rest Data
    .get(cctvRestAPI_cont.readData)         // Read Rest Data
    .put(cctvRestAPI_cont.updateData)       // Updata Rest Data
    .delete(cctvRestAPI_cont.createData);   // Delete Rest Data

/** 실시간 영상 */
route.route('/rest/stream/getStreamHost')
.get(cctvLiveApi_cont.getStreamHost)         // CCTV Stream Video Webserver Infomation Load

route.route('/rest/stream/getCCTVLiveStatus')
    .get(cctvLiveApi_cont.getCCTVLiveStatus)         // NVR에 연결된 CCTV들의 현재 상태를 가져온다.

route.route('/rest/stream/streamplay')
    .get(cctvLiveApi_cont.readData)         // Read Rest Data RTSP Recode Video player open

route.route('/rest/stream/disconnect')
    .delete(cctvLiveApi_cont.deleteData)         // Delete Rest Data RTSP Recode Video player disconnect


// 녹화영상
route.route('/rest/recode/getReplayHost')
    .get(cctvReplayAPI_cont.getReplayHost)         // CCTV Repaly Video Webserver Infomation Load

route.route('/rest/recode/calendar/:searchDate')
    .get(cctvCalendarAPI_cont.readData)            // Read Rest Data Calendar Recode Date read

route.route('/rest/recode/calendar/:searchDate/:cctvNo')
    .get(cctvCalendarAPI_cont.readData)            // Read Rest Data Calendar Recode Date read


route.route('/rest/recode/timeline/:cctvNo/:searchDate/:searchSTime/:searchETime')
    .get(cctvTimelineAPI_cont.readData)            // Read Rest Data Timeline read
    
route.route('/rest/recode/replay/:cctvNo/:searchDate/:searchSTime/:searchETime')
    .get(cctvReplayAPI_cont.readData)              // Read Rest Data RTSP Recode Video player open

route.route('/rest/recode/disconnect')
    .delete(cctvReplayAPI_cont.deleteData)         // Delete Rest Data RTSP Recode Video player disconnect


// 설정 페이지 Preview 영상
route.route('/rest/setting/getPreviewHost')
    .get(cctvPreviewApi_cont.getPreviewHost)       // CCTV Preview Webserver Infomation Load

route.route('/rest/setting/previewPlay/:cctvNo')
    .get(cctvPreviewApi_cont.readData)             // Read Rest Data Preview Video player open

route.route('/rest/setting/disconnect')
    .delete(cctvPreviewApi_cont.deleteData)        // Delete Rest Data RTSP Preview Video player disconnect    

// [작업중]미완
route.route('/rest/recode/getrecdownload')
.get(cctvReplayAPI_cont.getRecDownload)            // CCTV Recode Video download




module.exports = route;


