const Stream = require('node-rtsp-stream');


/* ffmpeg 실시간 송출코드 */
function openSUNAPIMultyCam(camPlayInfoArr){

	let liveStreamArr = new Array();
	console.log(liveStreamArr);

	let timerStartChk;
	for(let i = 0; i < camPlayInfoArr.length; i++){
		timerStartChk = "N";
		console.log("\r\n\r\n##openSUNAPICam module start No." + (i+1) + " Camera");
		console.log("1) Streaming start...." + camPlayInfoArr[i].streamName );
		console.log("2) streamUrl : " + camPlayInfoArr[i].rtspUrl);
		console.log("3) wsPort : " + camPlayInfoArr[i].wsPort +"\r\n\r\n");

		let rtspInfo = {
						"name":camPlayInfoArr[i].streamName
						, "url":camPlayInfoArr[i].rtspUrl
						, "port":camPlayInfoArr[i].wsPort
						, "stream":null
						, "lastData":null
					}

		liveStreamArr[i] = openStream(rtspInfo);
	}

	return liveStreamArr;
}



function openStream(obj){
    var stream = new Stream({
            name: 'name',
            streamUrl : obj.url,
            wsPort: obj.port,
            ffmpegOptions: { // options ffmpeg flags
                /** backup */
                '-stats': '', // an option with no neccessary value uses a blank string
                '-r': 30 // options with required values specify the value after the key
                // '-q:v':32,
                // '-b:v' : '1500K'
            }
    });

    obj.stream = stream;

    return stream;
}

//openSUNAPIMultyCam();

module.exports = (camPlayInfo) => openSUNAPIMultyCam(camPlayInfo);

