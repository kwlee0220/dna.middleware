/** ### 녹화영상 입출력 관련 Controller */
const PropsReader = require("properties-reader");
const requestIp = require('request-ip'); 
const basicProp = PropsReader('./properties/basicProxy.properties');

const nvrMapper = require("../mapper/nvrInfo_mapper");

/* 송출중인 replay영상 Array 객체 */
let recStream;


// function createData (req, res){
//     console.log("데이터가 생성되었습니다.");
//     res.send("Data create");
// }

/** 녹화영상 Webserver IP&Port 전송 */
function getReplayHost(req, res){
  // 접속한 web 클라이언트 ip
  const wsIp = basicProp.get("DNA_MW_WEBSOCK_HOST");
  // const wsIP = basicProp.get("ws.ip"); // test용 properties 파일 내용

  const wsPort = basicProp.get("DNA_MW_WEBSOCK_REPLAY_PORT");
  const resString = "wsIP=" + wsIp + "\r\nwsPort=" + wsPort;

  console.log("\r\nLoad Replay Websocket URL information");
  console.log(resString);

  res.send(resString);
}


/** 녹화영상 Play */
async function readData(req, res){
    const nvrApi = require("../custom_modules/nvrGetData_modules/callNvrData");
    const streamApi = require("../custom_modules/cctvStream_modules/rtspCameraStream");

    // const nvrIp = basicProp.get("cctv.ip"); // ictway 대전지사 연결 시 내부 ip에서 외부 ip 호출 불가

    /* NVR Info */
    const nvrVo = await nvrMapper.searchUsedNvrInfo();
    const nvrIp = nvrVo[0].nvr_ip;
    const nvrPort = nvrVo[0].nvr_port;
    const nvrAuthName = nvrVo[0].nvr_username; 
    const nvrAuthPass = nvrVo[0].nvr_password;
    console.log(nvrVo);
    
    const wsPort_replay = basicProp.get("DNA_MW_WEBSOCK_REPLAY_PORT"); 

    const cctvNo = Number(req.params.cctvNo) - 1;
    const searchDate = req.params.searchDate;
    const searchSTime = req.params.searchSTime;
    const searchETime = req.params.searchETime;

    // data 확인 후 삭제
    console.log("\r\n");
    console.log("입력값 확인 \ncctvNo : " + cctvNo + "\nsearchDate : " + searchDate + "\nsearchSTime : " + searchSTime + "\nsearchETime : " + searchETime);
    console.log("\r\n");
    
    let startDateTime = searchDate.replaceAll("-", "") + "T" + searchSTime.replaceAll(":", "");
    let endDateTime = searchDate.replaceAll("-", "") + "T" + searchETime.replaceAll(":", "");
    
    /* Overlap 조회 */
    let overlapRestUrl = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/recording.cgi?msubmenu=overlapped&action=view&FromDate=" 
                      + searchDate + "T" + searchSTime + "Z&ToDate=" + searchDate + "T" + searchETime + "Z";
    console.log("overlapRestUrl : " + overlapRestUrl);

    let overlap = await nvrApi(overlapRestUrl).then(function(res){
      let temp = res.replace("\r\n", "").split("=");
      return temp[1];
    }, function(err){
      console.log(err);
      return err;
    });              
    
    
    /* Session 조회 */
    let sessionRestUrl = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/media.cgi?msubmenu=sessionkey&action=view";
    console.log("sessionRestUrl : " + sessionRestUrl);

    let session = await nvrApi(sessionRestUrl).then(function(res){
      let temp = res.replace("\r\n", "").split("=");
      return temp[1];
    }, function(err){
      console.log(err);
      return err;
    });
    
    
    /* PlaybackChannel 조회 */
    let playbackChannelReqUrl = "http://" + nvrIp + ":" + nvrPort + "/stw-cgi/media.cgi?msubmenu=streamuri&action=view&Channel=" + cctvNo + "&MediaType=Search&Mode=Full&ClientType=PC";
    console.log("playbackChannelReqUrl : " + playbackChannelReqUrl);

    let playbackChannel = await nvrApi(playbackChannelReqUrl).then(function(res){

      let temp = res.split("=");
      console.log(temp);
      let tempUrl = temp[1].replace("rtsp://", "");
      let tempArr = tempUrl.split("/"); // [ip]:[port]/PlaybackChannel/[cctvNo]/media.smp
      let resultUrl = tempArr[0] + "/" + tempArr[1] + "/" + cctvNo + "/" + tempArr[3]
      return resultUrl.replace("\r\n", "");
    }, function(err){
      console.log(err);
      return err;
    });
    

    /* ffmpeg 송출코드 */
    let replayRTSPurl = "rtsp://" + nvrAuthName + ":" + nvrAuthPass + "@" + playbackChannel + "/start=" + startDateTime + "&end=" + endDateTime + "&overlap=" + overlap + "&session=" + session
    console.log("\r\n");
    console.log(">>>> replayRTSPurl : " + replayRTSPurl);

    
    const ws_VideoName= "ws_replayVideo";
    const camPlayInfo = {
      streamName: ws_VideoName,
      rtspUrl: replayRTSPurl,
      wsPort: wsPort_replay
    };


    // Streaming play
    recStream  = streamApi(camPlayInfo)
    res.send("Recode Video Websocket open...");
    
}

// function updateData(req, res){
//     console.log("데이터가 수정되었습니다.");
//     res.send("Data update");
// }


/** 페이지 닫기 | 이동 | 새로고침 시 event */
function deleteData(req, res){
  console.log("recStream disconnected");

  if(recStream !== null && typeof recStream !== 'undefined'){
    recStream.stop();
  }

  res.send("Recode Video Stream stop...");
}


/** [제작필요] 녹화영상 다운로드 */
function getRecDownload(req, res, next){
  const fileName = 'file.ext';  
  
  
  res.setHeader("Content-Disposition", "attachment; filename=${fileName}"); // 이게 핵심 
  res.sendFile('파일경로');
}



// module.exports.createData = createData;
module.exports.readData = readData;
// module.exports.updateData = updateData;
module.exports.deleteData = deleteData;
module.exports.getReplayHost = getReplayHost;
module.exports.getRecDownload = getRecDownload;
