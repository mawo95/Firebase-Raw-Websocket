const { Rtdb } = require("./firebase/rtdb");
const { Firestore } = require("./firebase/firestore")


function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms)
    );
}



class Bot {
  constructor(appCheckToken,y) {
  
    
    
    this.roomIdsDb = null
      this.invDb = null
      this.roomDb = null
    this.token = appCheckToken
    this.firestore = null

    this.uid = null
    this.wl = null
    this.giveCount = 0
    this.positionIndex = 0
    this.mode = "cards"

  }
    
    sleep(ms) {

    return new Promise((resolve)=>setTimeout(resolve, ms)

    );

}
    
    
    
    async init(){
        return new Promise(async(resolve, reject) => {
        this.roomDb = await new Rtdb("https://mf24-trading-rooms.europe-west1.firebasedatabase.app",true)
        await this.roomDb.init()
        this.invDb = await new Rtdb("https://mf24-trading-invites.europe-west1.firebasedatabase.app",true)
        await this.invDb.init()
        this.roomIdsDb = await new Rtdb("https://mf24-room-ids.europe-west1.firebasedatabase.app",true)
        await this.roomIdsDb.init()
        this.firestore = new Firestore()
        resolve()
        })
    }
    
  async logout(){
      return new Promise(async(resolve, reject) => {
      	  await this.roomIdsDb.logout()
          await this.roomDb.logout()
          await this.invDb.logout()
          resolve()
      })
  }

  async login(idToken) {
    return new Promise(async(resolve,reject) => {
      await this.roomIdsDb.login(idToken)
      await this.roomDb.login(idToken)
      await this.invDb.login(idToken)
      resolve()
    })
  }

    
    
    async InviteUser(username, inviter, nation, interaction, timeout = 60) {
  return new Promise(async (resolve, reject) => {
    const data = await this.firestore.readData("usernames", username);

    if (data !== "nope") {
      const uidToInvite = data.uid.stringValue;
      const invPath = uidToInvite + "/" + this.roomIdsDb.uid;
      const setData = {
        "b": nation,
        "u": inviter,
        "t": new Date().getTime(),
      };
      await this.invDb.setData(invPath, setData);

      var invTimer;
      invTimer = setTimeout(async function () {
        await this.invDb.setData(invPath, null);
        resolve("expired");
      }.bind(this), timeout * 1000);

      var roomIdData;
      const roomsRefPath = this.roomIdsDb.uid;
      await this.roomIdsDb.setData(roomsRefPath, null);

      const callback = this.roomIdsDb.onValue(roomsRefPath, async (snap) => {
        if (snap.val() == null) {
        } else {
          await this.invDb.setData(invPath, null);
          await this.roomIdsDb.setData(roomsRefPath, null);
          await this.roomIdsDb.off(callback);
          roomIdData = snap.val();
          const hosting = roomIdData.split(",")[1] === "true";
          const roomId = roomIdData.split(",")[0];
          console.log("Accepted");
          clearTimeout(invTimer);
          resolve({
            username,
            uidToInvite,
            inviter,
            nation,
            interaction,
            hosting,
            roomId,
          });
        }
      });
    } else {
      (async () => {
        await interaction.followUp("<@" + interaction.user.id + "> Enter a valid username");
        resolve("invalid");
      })();
    }
  });
}

    
    
    
    
    

    async joinTrade(result) {
        var myProfile;
        var myAction;
        var otherProfile;
        var otherAction;
  if (result.hosting) {
    myProfile = "h";
    myAction = "H";
    otherProfile = "g";
    otherAction = "G";
  } else {
    myProfile = "g";

    myAction = "G";

    otherProfile = "h";

    otherAction = "H"
    
  }
  

  console.log("Setting bot in trade")
        try{
  await update(ref(this.roomsDatabase, result.roomId), {
      [myProfile]:{
    a: this.uid,
    b: result.inviter,
    c: result.nation,
    d: {},
    e: { "0": 11 },
    f: 69,
    g: "",
    h: "",
    i: "",
    j: "",
    k: "",
    u1: this.uid,
    u2: result.uidToInvite
          }
  });

 
  
  await update(ref(this.roomsDatabase, result.roomId), {
      [myAction]:{
    x: "b"
          }
  });
            console.log("Done")

 

        
        

  return new Promise((resolve, reject) => {
      const callback = onValue(ref(this.roomsDatabase, result.roomId+"/"+otherAction),async (snap)=>{
       //   console.log(snap.val())
          if(snap.val() != null){
              var gettinglol = await get(ref(this.roomsDatabase,result.roomId+"/"+otherProfile+"/d"))
              this.wl = gettinglol.val()
              off(ref(this.roomsDatabase,result.roomId+"/"+otherAction), callback)
        resolve({
      myAction: myAction,
      myProfile: myProfile,
      otherAction: otherAction,
      otherProfile: otherProfile,
            roomId:result.roomId
        });
              }
          })
  });
    }catch{
        return new Promise((resolve, reject) => {
            resolve("error")
            })
        
    }
        }
            
            

    
  
    async trade(place, data,autoAccept, timeout=120, withdraw=false){
        var firstfun = true
        try{
            var isWithdraw
            var type
            var itemsIGot
            var itemArr
            var coinsIGot
            var amount
            var positionIndexForWithdraw = 0
            var arrayIndexForWithdraw = 0
            var givenItems = []
            var indexManager = {}
            
            if(withdraw){
                isWithdraw = true
                type = withdraw.withdraw
                itemsIGot = JSON.parse(data.give[type])
                coinsIGot = data.give.coins
                amount = data.give.left
                itemArr = Object.keys(itemsIGot);
                itemArr.sort((a, b) => itemsIGot[b] - itemsIGot[a]);

            }
        

        const action = {
            ready:"h",
            unready:"i",
            confirm:"k",
            cancel:"j",
            handshake:"l",
            emoji:"n",
            messageCoins:"r",
            message:"m",
            coins:"q",
            packs:"o",
            cards:"e",
            random:"t",
            inTrade:"b",
            remove:"f",
            choosing:"c",
            opinion:"g"
            
            

        }
        
       
        
        var myProfileLol = place.myProfile
        const myAction = place.myAction
        const tradeReference = ref(this.roomsDatabase,place.roomId)
        var tradeTimer = setTimeout(async function() {


          return new Promise((resolve, reject) => {

            (async()=>{
                console.log("Lefting...")
                try{
                await update(tradeReference,{
                    [myAction]:null
                })
                    console.log("Worked")
                }catch{
                    console.log("Failed")
                    try{
                        await set(tradeReference,{
                            [myAction]:null
                        })
                    }catch{
                        
                    }
                }
            resolve("expired")

            })()

            })
         },timeout*1000);
        return new Promise((resolve, reject)=>{
            var otherItemsGave = 0

            var otherCoinsGave = 0
                
            const callback = onValue(ref(this.roomsDatabase,place.roomId+"/"+place.otherAction),async (snapshot)=>{
                
                
                const callback2 = onValue(ref(this.roomsDatabase,place.roomId+"/"+place.otherProfile),async (snapshot2)=>{
                    console.log(snapshot2.val())
                    })
                
                
                
                
                console.log(snapshot.val())
          
                if(snapshot.val() == null){
                    clearTimeout(tradeTimer)
                    off(tradeReference, callback)
                    resolve({
                        status:false,
                        msg:"The player left the trade"
                        })
                    
                }else if(snapshot.val().x == action.messageCoins){
                    if(isWithdraw){
                        const ammmm = parseInt(snapshot.val().v.slice(0, -1))
                        if(10000000 < ammmm){
                            
                        }else if(coinsIGot < ammmm){
                            await update(tradeReference, {
                                [myAction]:{
                                    x:action.message,
                                    v:"10" + String.fromCharCode(65 + Math.floor(Math.random() * 26))
                                }
                            })
                            
                            
                        }else{
                            await update(tradeReference, {

                            [myAction]: {

                                x: "s"

                            }

                        });
                            
                            await update(tradeReference, {
                                [myAction]:{
                                    x:action.coins,
                                    v:ammmm
                                }
                            })
                            
                            await update(tradeReference, {
                                [myAction]:{
                                    x:action.emoji,
                                    v:"0" + String.fromCharCode(97 + Math.floor(Math.random() * 26))
                                }
                            })
                        }
                        
                    }
         
                }else if(snapshot.val().x == action.opinion){
                    if(withdraw){
                    if(snapshot.val().b == true){
                    const indexToRemove = snapshot.val().a
                    try{
                        itemArr.push(indexManager[snapshot.val().a])
                    }catch{}
                        const beforeThere = indexManager[snapshot.val().a]
                        indexManager[snapshot.val().a] = undefined
                        const arrayIndexLol = arrayIndexForWithdraw
                        const packName = itemArr[arrayIndexLol];
                        if(packName != undefined && packName != beforeThere){
                        if(type == "packs"){
                                await update(tradeReference, {
                                    [myAction]: {
                                        x: action.packs,
                                        a: packName,
                                        b: 1,
                                        c: indexToRemove
                                    }
                                });
                                }else{
                                    
                                    await update(tradeReference, {

   [myAction]: {

       v: indexToRemove,

       x: "c"

   }

});
     
                                    
                                    await update(tradeReference, {
                                    [myAction]: {
                                        x: action.cards,
                                        v: packName + "," + indexToRemove
                                    }
                                });
                                    
                                }
                            indexManager[indexToRemove] = packName
                                itemArr.splice(itemArr.indexOf(packName), 1)
                            
                            
                        
                                arrayIndexForWithdraw++
                        }else{
                           arrayIndexForWithdraw = 0
                            const arrayIndexLol = 0
                        	const packName = itemArr[arrayIndexLol];

                        if(type == "packs"){
                                await update(tradeReference, {
                                    [myAction]: {
                                        x: action.packs,
                                        a: packName,
                                        b: 1,
                                        c: indexToRemove
                                    }
                                });
                                }else{
                                    
                                    await update(tradeReference, {

   [myAction]: {

       v: indexToRemove,

       x: "c"

   }

});
                                    await update(tradeReference, {
                                    [myAction]: {
                                        x: action.cards,
                                        v: packName + "," + indexToRemove
                                    }
                                });
                                    
                                }
                            indexManager[indexToRemove] = packName
                                itemArr.splice(itemArr.indexOf(packName), 1)
                                arrayIndexForWithdraw++
                            
                            
                        }
     
                    }
                    }
                    
                    
                    
                    
                    
                    
                }else if(snapshot.val().x == action.inTrade){
                    
                    if(data.give == "crash"){
                        
                        await update(tradeReference, {

   [myAction]: {

       v: 69,

       x: "c"

   }

});
                        update(tradeReference, {
                            [myAction]:{
                                x:action.cards,
                                v:"id009,69"
                            }
                        })
                        
                    }
    
                    else if(data.give){
                        if(isWithdraw){
                            for (let io = 0; io != 3; io++) {
                            const packName = itemArr[0];
                            if(packName == undefined){
                                    break;
                            }
                                if(type == "packs"){

                                await update(tradeReference, {
                                    [myAction]: {
                                        x: action.packs,
                                        a: packName,
                                        b: 1,
                                        c: this.positionIndex.toString()
                                    }
                                });
                                }else{
                                    
                                    await update(tradeReference, {

   [myAction]: {

       v: this.positionIndex,

       x: "c"

   }

});
                                    await update(tradeReference, {
                                    [myAction]: {
                                        x: action.cards,
                                        v: packName + "," + this.positionIndex.toString()
                                    }
                                });
                                    
                                }
								indexManager[this.positionIndex.toString()] = packName
                                itemArr.splice(itemArr.indexOf(packName), 1)
                                this.positionIndex++;
                 
                        }
              
                        }else{

                        if(data.give.coins > 0 && data.give.coins <= 10000000){
                            
                            await update(tradeReference, {

                            [myAction]: {

                                x: "s"

                            }

                        });
                            update(tradeReference, {
                                [myAction]:{
                                    x:action.coins,
                                    v:data.give.coins
                                    }
                                })
                            }else{console.log("Invalid coins value")}
                        //coins gave
                        
                       
                         
                            if(data.give.cards == "wishlist"){
                                
                                if(this.wl != null){
                            for(var card of this.wl){
                                if(this.giveCount < 3){
                                    
                                    await update(tradeReference, {

   [myAction]: {

       v: this.positionIndex,

       x: "c"

   }

});
                                    update(tradeReference,{
                                        [myAction]:{
                                            x:action.cards,
                                            v:card+","+this.positionIndex.toString()
                                            }
                                        })
                                    this.positionIndex++
                                    this.giveCount++
                                    }else{}
                                }
                                    }else{
                                        this.mode = "packs"
                                    }
                                }else{
                                    if(data.give.cards.length == 0){
                                        this.mode = "packs"
                                        }
                                    for(var card of data.give.cards){
                                        if(this.giveCount < 3){
                                            
                                            await update(tradeReference, {

   [myAction]: {

       v: this.positionIndex,

       x: "c"

   }

});
                                            update(tradeReference, {
                                                [myAction]:{
                                                    x:action.cards,
                                                    v:card+","+this.positionIndex.toString()
                                                    }
                                                })
                                            this.positionIndex++
                                            this.giveCount++
                                            }else{}
                                        }
                                    }
                        
                        for(var pack of data.give.packs){
                            if(this.giveCount < 3){
                                update(tradeReference,{
                                    [myAction]:{
                                    x:action.packs,
                                    a:pack,
                                    b:1,
                                    c:this.positionIndex.toString()
                                    }
                                    })
                                this.positionIndex++
                                this.giveCount++
                                       
                                
                        }else{}
                            }
                         
                    
                   }
                    }
                    
                    
                    }else if(snapshot.val().x == action.message){
                        //if(snapshot.val().v.toString().contains("4")){
                            if(this.mode == "packs" || data.give == false || data.switch == false){}else{
                                this.mode = "packs"
                                var removeCount = 0
                                while(removeCount <= 2){
                                    update(tradeReference, {
                                        [myAction]:{
                                            x:action.remove,
                                            v:removeCount
                                            }
                                        })
                                    removeCount++
                                    this.giveCount--
                                    
                                    
                                    }
                                this.positionIndex = 0
                                this.giveCount = 0
                                for(var pack of data.give.packs){
                                    if(this.giveCount < 3){
                                        update(tradeReference,{
                                            [myAction]:{
                                                x:action.packs,
                                                a:pack,
                                                b:1,
                                                c:this.positionIndex
                                                }
                                            })
                                        this.giveCount++
                                        this.positionIndex++
                                        }else{}
                                    }
                                            
                            //changing to packs
                                
                                }
                       //     }else{}
                            
                    }else if(snapshot.val().x == action.emoji){
                        if(this.mode == "cards" || data.give == false || data.switch == false){}else{
                            this.mode = "cards"
                            removeCount = 0

                                while(removeCount <= 2){

                                    update(tradeReference, {

                                        [myAction]:{

                                            x:action.remove,

                                            v:removeCount

                                            }

                                        })

                                    removeCount++

                                    this.giveCount--

                                    

                                    

                                    }
                            this.positionIndex = 0
                            this.giveCount = 0
                            if(data.give.cards == "wishlist"){
                                if(this.wl != null){
                            for(var card of this.wl){
                                if(this.giveCount < 3){
                                    
                                    await update(tradeReference, {

   [myAction]: {

       v: this.positionIndex,

       x: "c"

   }

});
                                    update(tradeReference,{
                                        [myAction]:{
                                            x:action.cards,
                                            v:card+","+this.positionIndex.toString()
                                            }
                                        })
                                    this.giveCount++
                                    this.positionIndex++
                                    }else{}
                                }
                                    }else{}
                                }else{
                                    
                                    for(var card of data.give.cards){

                                if(this.giveCount < 3){
                                    
                                    await update(tradeReference, {

   [myAction]: {

       v: this.positionIndex,

       x: "c"

   }

});

                                    update(tradeReference,{

                                        [myAction]:{

                                            x:action.cards,

                                            v:card+","+this.positionIndex.toString()

                                            }

                                        })

                                    this.giveCount++

                                    this.positionIndex++

                                    }else{}
                                        
                                    }
                                    }
                                    //adding normal cards 
                            
                        //changing to cards
                            }
                    }else if(snapshot.val().x == action.ready){
                      
                        if(!data.receive){
                            
                           
                           
                        if(otherItemsGave > 0 || otherCoinsGave > 0){
  //await here                          
                             update(tradeReference, {
                                [myAction]:{
                                    x:action.emoji,
                                    v:"6Q"
                                    }
                                })
                            //await here
                             update(tradeReference,{
                                [myAction]:{
                                    x:action.inTrade
                                    }
                                })
                                    
                            //emoji
                            }else{
                            
          
                           

                    
                  update(tradeReference, {
                        [myAction]:{
                        x:action.ready
                            }
                        })
                                        }
                            }else{
                              
                                update(tradeReference, {
                                    [myAction]:{
                                        x:action.ready
                                        }
                                    })
                                }
      
                    }else if(snapshot.val().x == action.confirm){
                        update(tradeReference, {
                            [myAction]:{
                            x:action.confirm
                                }
                            })
                        }else if(snapshot.val().x == action.handshake){
                            var a = 0
                            var b = 0
                            var c = 0
                            var d = 0
                            var e = 0
                            
                            if(snapshot.val().hasOwnProperty('a')){
                            a = snapshot.val().a
                                }
                            if(snapshot.val().hasOwnProperty('b')){
                           
                            
                            b = snapshot.val().b
                                }
                            if(snapshot.val().hasOwnProperty('c')){
                                
                           
                            c = snapshot.val().c
                                }
                            if(snapshot.val().hasOwnProperty('d')){
                            
                            
                            d = snapshot.val().d
                                }
                               
                            
                            e =
                                  snapshot.val().e
                                
                            await update(tradeReference, {
                                [myAction]:{
                                x:action.handshake,
                                a:b,
                                b:a,
                                c:d,
                                d:c,
                                e:-e
                                    }
                                })
                            console.log("Set handshake")
                           
                            // a: cards giving

                        // b: cards getting

                        // c: packs giving

                        // d: packs getting

                        // e: coins i get
                            clearTimeout(tradeTimer)
                            off(tradeReference, callback)
                            resolve({
                                status:true,
                                cardsGiving:b,
                                cardsGetting:a,
                                packsGiving:d,
                                packsGetting:c,
                                botTrades:0,
                                coins:-e
                                })
                            }else if(snapshot.val().x == action.cards){
                                otherItemsGave++ 
                                if(!data.receive){
                                update(tradeReference, {
                                    [myAction]:{
                                        x:action.opinion,
                                        a:"1",
                                        b:true
                                    }
                                })
                                update(tradeReference, {
                                    [myAction]:{
                                        x:action.opinion,
                                        a:"0",
                                        b:true
                                    }
                                })
                                update(tradeReference, {
                                    [myAction]:{
                                        x:action.opinion,
                                        a:"2",
                                        b:true
                                    }
                                })}
                                }else if(snapshot.val().x == action.packs){
                                   otherItemsGave++
                                   if(!data.receive){
                                    update(tradeReference, {
                                    [myAction]:{
                                        x:action.opinion,
                                        a:"1",
                                        b:true
                                    }
                                })
                                    update(tradeReference, {
                                    [myAction]:{
                                        x:action.opinion,
                                        a:"2",
                                        b:true
                                    }
                                })
                                    update(tradeReference, {
                                    [myAction]:{
                                        x:action.opinion,
                                        a:"0",
                                        b:true
                                    }
                                })}
                                    }else if(snapshot.val().x == action.coins){
                                        otherCoinsGave = snapshot.val().v
                                        if(!data.receive){
                                        if(otherCoinsGave != 0){
                                            await update(tradeReference, {
                                                [myAction]:{
                                                x:action.messageCoins,
                                                v:0
                                                }
                                            })
                                        }else{
                                            await update(tradeReference, {
                                                [myAction]:{
                                                    x:action.emoji,
                                                    v:"0R"
                                                }
                                            })
                                        }}
                                        }else if(snapshot.val().x == action.remove){
                                            otherItemsGave--
                                            }else if(snapshot.val().x == action.cancel){
                                                update(tradeReference,{
                                                    [myAction]:{
                                                        x:action.cancel
                                                        }
                                                    })
                                                }else{}
                                       
                                
                                
                        
            })
            })
            
            
        }catch{
            return new Promise((resolve, reject) => {
                resolve("error")
                })
        }
    }
    

}

module.exports = Bot;
