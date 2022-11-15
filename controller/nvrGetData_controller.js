const nvrApi = require('../nvrGetData_modules/getNvrAddress');
const callData = require('../nvrGetData_modules/callNvrData');

async function getDeviceInfo(){
//  var diveceInfo = await callData(nvrApi.getDeviceInfo);
//  console.log(diveceInfo);
    console.log(nvrApi.getDeviceInfo);
}

//test
getDeviceInfo();

