/** ### 현재 가동중인 middleware의 ip정보를 돌려준다 
 * return
 *  - 예1) 192.168.1.101
 *  - 예2)10.0.0.101
*/

function getLocalIP(){
    var os = require('os');
    var ifaces = os.networkInterfaces();
    
    var localIp;
    Object.keys(ifaces).forEach(function (ifname) {
      var alias = 0;
    
      ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }
    
        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          console.log(ifname + ':' + alias, iface.address);
        } else {
          // this interface has only one ipv4 address
          console.log(ifname, iface.address);
        }

        localIp = iface.address
        ++alias;
      });
    });

    console.log(localIp);
    return localIp;
}


module.exports = ()=> getLocalIP();


