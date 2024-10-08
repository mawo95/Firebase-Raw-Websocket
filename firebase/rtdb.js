const WebSocket = require('ws');

class Rtdb {
  constructor(url, debug = false) {
    this.rawUrl = url;
    this.wsUrl = this.rawUrl.replace('https://', 'wss://') + '/.ws?v=5';
    this.appcheckUsed = false;
    this.signedIn = false;
    this.amInviting = false;
    this.uid = null;
    this.debug = debug
    this.listeners = {}
    console.log("Rtdb rest client started");
      this.startPingInterval()
  }
    
    
    startPingInterval() {
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping('0', null, true);
      }
    }, 1000*60*2);
  }
    
    stopPingInterval() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
    
    
    
    
    async init() {
  return new Promise((resolve, reject) => {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      console.log("WebSocket connection to RTDB (" + this.rawUrl + ") is open");
      resolve();
    });
      
      
          this.ws.on('message',async (message) => { 
              if(this.debug){
        console.log("Received data from RTDB (" + this.rawUrl + "): " + message);
              }
              
              const messageo = JSON.parse(message)
              if(messageo && messageo.t === 'd' && messageo.d && messageo.d.b && messageo.d.b.s === 'ok' && messageo.d.b.d && messageo.d.b.d.auth){
              if(this.debug){
            	console.log(messageo.d.b.d.auth.uid)
              }
                  this.uid = messageo.d.b.d.auth.uid
              }
              
      });
      
      if(this.debug){

      this.ws.on('close',async (code, reason) => {
        console.log("WebSocket connection to RTDB (" + this.rawUrl + ") is closed with code: " + code);
        console.log("Close reason: " + reason);
        // You can handle reconnection or other actions here if needed.
      });

      this.ws.on('error',async (error) => {
        console.error("WebSocket error in RTDB (" + this.rawUrl + "): " + error);
        // You can handle error recovery or logging here.
      });
          
      }

      // You can optionally handle any cleanup here.
  });
}



    
    
  async logout(){
    this.stopPingInterval()
    return new Promise(async(resolve, reject) => {
      await this.ws.close()
      resolve()
    })
  }
    
  async appcheck(appcheck) {
    return new Promise(async(resolve, reject) => {
      const appcheckMsg = {
        "t": "d",
        "d": {
          "a": "appcheck",
          "r": 2,
          "b": {
            "token": appcheck
          }
        }
      }
      await this.ws.send(JSON.stringify(appcheckMsg), (error) => {
        if (error) {
          reject(error);
        } else {
          this.appcheckUsed = true;
          resolve();
        }
      });
    });
  }
    
    
    
    async login(idToken){
        return new Promise(async(resolve,reject)=>{
            const loginData = {
                "t":"d",
                "d":{
                    "a":"auth",
                    "r":1,
                    "b":{
                        "cred":idToken
                    }
                }
            }
            await this.ws.send(JSON.stringify(loginData), (error) =>{
                if(error){
                    reject(error)
                }else{
                    this.signedIn = true
                    resolve()
                }
            })
        })
    }
    
    
    
    async setData(path, data) {
      return new Promise(async (resolve, reject) => {
        try {
            const setDataPayload = {
                "t": "d",
                "d": {
                    "a": "p", 
                    "r": 1,
                    "b": {
                        "p": path, 
                        "d": data 
                    }
                }
            };
            this.ws.send(JSON.stringify(setDataPayload), (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        } catch (error) {
            reject(error);
        }
      });
    }
    
    
    
    onValue(path, callback) {
    	const listener = (event) => {
      		if (event.type === 'message') {
        		const data = JSON.parse(event.data);
        		if (data && data.d && data.d.p === path) {
          			const result = {
            			key: path,
            			val: () => data.d.d, 
          			};
          			callback(result);
        		}
      	}
    };
    this.listeners[callback] = listener;
    this.ws.addEventListener('message', listener);
    return callback;
  }
    
    off(callback) {
    if (this.listeners[callback]) {
      this.ws.removeEventListener('message', this.listeners[callback]);
      delete this.listeners[callback];
    }
  }
    
    

    

    
}

module.exports = {
  Rtdb
};