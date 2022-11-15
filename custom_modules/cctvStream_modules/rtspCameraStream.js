const Stream = require('node-rtsp-stream');


/* ffmpeg 실시간 송출코드 */
function openSUNAPICam(camPlayInfo){

    console.log("\r\n\r\n##openSUNAPICam module start");
    console.log("1) Streaming start...." + camPlayInfo.streamName );
    console.log("2) streamUrl : " + camPlayInfo.rtspUrl);
    console.log("3) wsPort : " + camPlayInfo.wsPort + "\r\n\r\n");

    let recStream = new Stream({
        name: camPlayInfo.streamName,
        streamUrl: camPlayInfo.rtspUrl,
        wsPort: camPlayInfo.wsPort,
        ffmpegOptions: { // options ffmpeg flags
            '-stats': '', // an option with no neccessary value uses a blank string
            '-r': 30, // options with required values specify the value after the key
            //'-q:v':32,
            //'-b:v' : '1500K'
        }
    });

    return recStream;
    
}


module.exports = (camPlayInfo) => openSUNAPICam(camPlayInfo);

