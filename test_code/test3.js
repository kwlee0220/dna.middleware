
const Stream = require('node-rtsp-stream');

var url = "rtsp://admin:ictway2020!!@192.168.35.150:35005/LiveChannel/0/media.smp";
var url2 = "rtsp://admin:ictway2020!!@192.168.35.150:35005/LiveChannel/1/media.smp";

var rtspList = [
    {"url":url,"port":8881, "stream":null,"lastData":null},
    {"url":url2,"port":8882, "stream":null,"lastData":null},
];

//var sendSecond = "";
var rtspListLength = rtspList.length;
for(var i=0; i<rtspListLength; i++){
    openStream(rtspList[i]);

    var timer = setInterval(function(obj){
            var today = new Date();

            if(obj.lastData !== undefined){
                    var stream_date = new Date(obj.lastData);
                    var gap = (today.getTime() - stream_date.getTime())/1000;
                    console.log(gap);
                    if(gap >= 5){//check gap of second
                            //obj.stream.stop();
                            //openStream(obj);


                            obj.lastData = today;
//                            obj.stream = obj.stream.restartStream();

                            obj.stream.mpeg1Muxer.on('ffmpegStderr', (data)=>{
                                console.log("영상 송출 시작");
                                var today = new Date();
                                    obj.lastData = today;
                            });


                    }
            }

    },100,rtspList[i]);

}

function openStream(obj){
    var stream = new Stream({
            name: 'name',
            streamUrl : obj.url,
            wsPort: obj.port,
            ffmpegOptions: { // options ffmpeg flags
                    '-stats': '', // an option with no neccessary value uses a blank string
                    '-r': 30, // options with required values specify the value after the key
            }
    });

    obj.stream = stream;

    stream.mpeg1Muxer.on('ffmpegStderr', (data)=>{

            console.log("StreamOpen")
            var today = new Date();
            obj.lastData = today;
    });
}