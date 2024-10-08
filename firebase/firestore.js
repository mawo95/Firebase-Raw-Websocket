const axios = require("axios")

class Firestore {
    constructor(){
        this.url = "https://firestore.googleapis.com/v1/projects/madfut-24/databases/(default)/documents"
        console.log("Firestore rest client started")
    }
    
    
    
    async readData(collection,doc){
    	return new Promise(async(resolve, reject) => {
            var failed = false
            var response
             try{
    			response = await axios.get(this.url+"/"+collection+"/"+doc);
             }catch{
                 failed = true
                 resolve("nope")
             }
            if(!failed){
                    const data = response.data.fields;
                	resolve(data)
            }

    	})
    }
}

module.exports = {
    Firestore
}
