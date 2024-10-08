const moment = require("moment")
const jwt_decode = require("jwt-decode");
const Bot = require("./bot")
const fs = require("fs")
const sqlite = require('better-sqlite3');
const { getIdToken } = require("./auth")




class Functions{
  constructor(){
   
     







   
    
    this.database = new sqlite("database.db")
      this.database.exec("CREATE TABLE IF NOT EXISTS Players (id TEXT PRIMARY KEY, name TEXT, rating INTEGER, position TEXT, color TEXT, clubId INTEGER, leagueId INTEGER, nationId INTEGER, packable INTEGER)");
      this.database.exec('CREATE TABLE IF NOT EXISTS Packs (displayName TEXT, packId TEXT)');
      this.database.exec("CREATE TABLE IF NOT EXISTS Data (discordId INTEGER PRIMARY KEY, mfUsername TEXT, coins INTEGER DEFAULT 0, packs TEXT DEFAULT '{}', cards TEXT DEFAULT '{}', botTrades INTEGER DEFAULT 0, trades INTEGER DEFAULT 0)")


    this.userTrades = {}
    this.inTrade = {}
    this.acceptCode = false
    this.accArr =  []
      console.log("Functions ready")
  }
    
    
    
    
    async withdraw(type,amount,interaction,appCheckToken){
        const isLinked = await this.isLinked(interaction.user.id)
        if(!isLinked){
            await interaction.reply("You arent linked! To withdraw items, link your account with /link")
        }else if(this.userTrades[interaction.user.id] != undefined){
            await interaction.reply("You have open trades: " + this.userTrades[interaction.user.id] + " complete them, leave the trade or wait till the trade times out!")
        }else{
            this.userTrades[interaction.user.id] = "Withdraw of " + type + " " + amount + " times!"
            const linkedAcc = await this.dbGetCurrentLink(interaction.user.id)
            const mfUsername = linkedAcc.mfUsername
        	var trades = 0
            await interaction.reply("Your account " + mfUsername + " got invited for your withdraw!")
            this.userTrades
        	while(trades != amount){
                var itemsLeft = amount - trades
                const timemillis = await jwt_decode(appCheckToken).exp
    			var withdrawBot = new Bot(appCheckToken,timemillis)
    			const password = "mawo100"
    			var emailFound = false
    			var email
    			while(!emailFound){
    				email = this.accArr[Math.floor(Math.random() * this.accArr.length)]
        			if(this.inTrade[email] == undefined){
            			emailFound = true
            		}else{
                	}
        		}
            	await withdrawBot.login(email,password)
                const result = await withdrawBot.InviteUser(mfUsername,"withdraw","nation_badge_21",interaction)
            	if(result == "expired"){
                    await withdrawBot.logout()
                    withdrawBot = undefined
                	await interaction.followUp("Withdraw invite timed out!")
                	trades = amount
            	}else{
            		const props = await withdrawBot.joinTrade(result)
                    const usersWallet = await this.getWallet(interaction.user.id)
                    var stuffIGot
                    if(type == "cards"){
                        stuffIGot = {
                            cards:usersWallet.cards,
                            coins:usersWallet.coins,
                            left:itemsLeft
                            
                        }
                    }else{
                        stuffIGot = {
                            packs:usersWallet.packs,
                            coins:usersWallet.coins,
                            left:itemsLeft
                        }
                    }
                    const tradeResult = await withdrawBot.trade(props,{give:stuffIGot,receive:false,switch:false},false,300,{withdraw:type})
                    if(tradeResult == "expired"){
                        await interaction.followUp("Your trade expired")
                        this.userTrades[interaction.user.id] = undefined
                        await withdrawBot.logout()
                        withdrawBot = undefined
                        trades = amount
                    }else if(!tradeResult.status){
                    	await interaction.followUp("Your withdraw has stopped!")
                        this.userTrades[interaction.user.id] = undefined
                        trades = amount
                    }else if(tradeResult.status){
                        //wallet logic
                        trades++
                        const dbRes = await this.dbWalletWithdraw(interaction.user.id, tradeResult)
                        if(dbRes){
                        	await interaction.followUp("Sucessfully withdrawed")
                        }else{
                            await interaction.reply("Error at withdrawing. Notice mawo please.")
                            this.userTrades[interaction.user.id] = undefined
                        }
                        
                    }else{
                        trades = amount
                        await interaction.reply(JSON.stringify(tradeResult))
                    }
                    
                    
                    
                    
                    
                }
                
                
                
            }
            this.userTrades[interaction.user.id] = undefined
            
        }
        
        
        
        
    }
    
    
    
    
    
    
    
    // await this.removeBotTrade(discordId,amount)
    async withdrawBotTrades(interaction,amount,appCheckToken){
        const discordId = interaction.user.id
        const currentWallet = await this.getWallet(discordId)
        var botTradeAmount = currentWallet.botTrades
        if(this.userTrades[interaction.user.id] != undefined){
            await interaction.reply("You have open trades: " + this.userTrades[interaction.user.id] + " complete them, leave the trade or wait till the trade times out!")
        }else if(botTradeAmount >= amount && amount > 0){
            this.userTrades[interaction.user.id] = "Withdraw of " + amount + " wallet bot-trades!"
            await interaction.reply("Your withdraw for " + amount + " bot trades started! To stop them, leave a trade or let the trades time out (30 minutes)")
            const mfUser2 = await this.getCurrentLink(interaction)
            const mfUser = mfUser2.mfUsername
            var freetradesDone = 0
            while(freetradesDone < amount){
                const timemillis = await jwt_decode(appCheckToken).exp
      var freeTradesBotNoLogs = new Bot(appCheckToken, timemillis)
      const password = "mawo100"
      var emailFound = false
      var email
      while(!emailFound){
      	email = this.accArr[Math.floor(Math.random() * this.accArr.length)]
      	if(this.inTrade[email] == undefined){
          emailFound = true
         }else{}
      }
      await freeTradesBotNoLogs.login(email,password)
      this.inTrade[email] = password
      await freeTradesBotNoLogs.InviteUser(mfUser,"withdraw","nation_badge_21","notsureifneeded",1800) //30 minutes timer
    .then(async (result)=>{
      if(result == "expired"){
          amount = 0
          await interaction.followUp("Stopped your bot trades withdraw")
          this.userTrades[interaction.user.id] = undefined
          await freeTradesBotNoLogs.logout()
          freeTradesBotNoLogs = undefined

          //return false 
      }else{
      const propertys = await freeTradesBotNoLogs.joinTrade(result)
      const tradeResult = await freeTradesBotNoLogs.trade(propertys,{
          give:{
              cards:"wishlist",
              packs: ["95_special","94_special","93_special"],
              coins:10000000
          },
          receive:false,
          switch:true
      },false,300) 
      if(tradeResult == "expired"){
          amount = 0
          await interaction.followUp("Stopped your bot trades withdraw")
          this.userTrades[interaction.user.id] = undefined
          //false
      }
      else if(tradeResult.status){
          freetradesDone++
          await this.removeBotTrade(discordId,1)
          //true
      }else{
          amount = 0
          await interaction.followUp("Stopped your bot trades withdraw")
          this.userTrades[interaction.user.id] = undefined
          //false
          }
      }
          var logout = await freeTradesBotNoLogs.logout()
      if(logout){
          console.log("Signed out")
          }else{
              console.log("Couldnt sign out -> ram+")
          } 
      this.inTrade[email] = undefined
      freeTradesBotNoLogs = undefined
          })
               
 
            }
            this.userTrades[interaction.user.id] = undefined
            
        }else{
            await interaction.reply("You dont got that amount of bot trades in your wallet!")
            this.userTrades[interaction.user.id] = undefined
        }
        
    }
    
    
    
    async acceptBotcodeEnd(interaction){
        if(this.acceptCode == true){
            this.acceptCode = false
            await interaction.reply("Sucessfully ended!")
        }else{
            await interaction.reply("Theres no code running yet")     
        }
    }
    
    
    
    
    
    async getTradeAmount(discordId){
        const fStmt = this.database.prepare("SELECT trades FROM Data WHERE discordId = ?")
        const res = await fStmt.get(discordId)
        if(res != undefined){
        return res.trades
            }else{
                return 0
                }
        
    }
    async addTrade(discordId){
  //     try{
        const getStmt = this.database.prepare("SELECT trades FROM Data WHERE discordId = ?")
        const tradeAmount2 = await getStmt.get(discordId)
        console.log(discordId)
        console.log(tradeAmount2)
        var tradeAmount
        if(tradeAmount2 == undefined){
            tradeAmount = 0
        }else{
        tradeAmount = tradeAmount2.trades
        }
        const addStmt = this.database.prepare("UPDATE Data SET trades = ? WHERE discordId = ?")
        await addStmt.run(tradeAmount+=1,discordId)
        return true
       //    }catch{
          //     return false
         //      }
        
    }
    
    
    async removeBotTrade(discordId,amount){
        const getStmt = this.database.prepare("SELECT botTrades FROM Data WHERE discordId = ?")
        const botTradesAmount2 = await getStmt.get(discordId)
        const botTradesAmount = botTradesAmount2.botTrades
        const botTradesNow = botTradesAmount - amount
        const addStmt = this.database.prepare("UPDATE Data SET botTrades = ? WHERE discordId = ?")
        await addStmt.run(botTradesNow,discordId)
        return true    
    }
    
    

    async clearWallet(discordId){
        const clearStmt = this.database.prepare("UPDATE Data SET coins = 0, cards = '{}', packs = '{}', botTrades = 0 WHERE discordId = ?")
        await clearStmt.run(discordId)
        
        
        }
    
    
    
    
    async dbWalletWithdraw(discordId, result) {
  const currentWallet = await this.getWallet(discordId);

  // Remove coins
  currentWallet.coins -= Math.abs(result.coins);

  // Remove packs
  if (result.packsGiving !== 0) {
    const currentPacksObj = JSON.parse(currentWallet.packs);
    const packsGiving = result.packsGiving;

    for (const pack in packsGiving) {
      if (Object.prototype.hasOwnProperty.call(packsGiving, pack)) {
        if (currentPacksObj[pack] !== undefined) {
          const packsToRemove = Math.min(packsGiving[pack], currentPacksObj[pack]);
          currentPacksObj[pack] -= packsToRemove;

          if (currentPacksObj[pack] === 0) {
            delete currentPacksObj[pack];
          }

        }
      }
    }

    currentWallet.packs = JSON.stringify(currentPacksObj);
  }

  // Remove cards
        if (Array.isArray(result.cardsGiving)) {
    const currentCardsObj = JSON.parse(currentWallet.cards);
    const cardsGiving = result.cardsGiving;

    for (const card of cardsGiving) {
      if (currentCardsObj[card] !== undefined) {
        currentCardsObj[card]--;

        if (currentCardsObj[card] === 0) {
          delete currentCardsObj[card];
        }
      }
    }

    currentWallet.cards = JSON.stringify(currentCardsObj);
  }

  // Update the wallet in the database
  const stmt1 = this.database.prepare("UPDATE Data SET coins = ?, cards = ?, packs = ?, botTrades = ? WHERE discordId = ?");
  
  try {
    await stmt1.run(currentWallet.coins, currentWallet.cards, currentWallet.packs, currentWallet.botTrades, discordId);
    return true;
  } catch {
    return false;
  }
}

    
    
    
    
    
    
    
    
    async dbDeposit(result,discordId,admin){
        //interaction.followUp(JSON.stringify(result))
        
        var cheater = false
        //discordId = interaction.user.id
       var currentWallet = await this.getWallet(discordId)
        console.log(currentWallet)
        if(result.coins > 10000000 || result.coins < 0){
            cheater = true
            currentWallet.coins = currentWallet.coins += result.coins
            }else{
                
        currentWallet.coins = currentWallet.coins+=result.coins
                }
        currentWallet.botTrades = currentWallet.botTrades += result.botTrades
        var cardPackCounter = 0
        if(result.cardsGetting != 0){
           
            var currentObj = JSON.parse(currentWallet.cards)
            for(var card of result.cardsGetting){
                cardPackCounter++
                if(cardPackCounter > 3){
                    cheater = true//do some very eval stuff
                }else{}
                if(currentObj[card] == undefined){
                    currentObj[card] = 1
                }else{
                   
                    currentObj[card] += 1
             
                 
                    }
                    
                  //  }
                }
            currentWallet.cards = JSON.stringify(currentObj)
            }else{}
        
        
        if (result.packsGetting !== 0) {
  const currentObj = JSON.parse(currentWallet.packs);
  const packsGetting = result.packsGetting;

  for (const pack in packsGetting) {
    if (Object.prototype.hasOwnProperty.call(packsGetting, pack)) {
      cardPackCounter++;

      if (cardPackCounter > 3) {
          cheater = true
        // Perform additional evaluation logic
      } else {}
        if (currentObj[pack] === undefined) {
          if(packsGetting[pack] > 20){cheater = true}else{
          currentObj[pack] = packsGetting[pack];
              }
        } else {
            if(packsGetting[pack] > 20){
                cheater = true}else{
          currentObj[pack] += packsGetting[pack];
                    }
        }
    //  }
    }
  }

  currentWallet.packs = JSON.stringify(currentObj);
        }else{}
        
        
        
  
        const stmt1 = this.database.prepare("UPDATE Data SET coins = ?, cards = ?, packs = ?, botTrades = ? WHERE discordId = ?");
        if(!cheater || admin){
    
        try{
            await stmt1.run(currentWallet.coins,currentWallet.cards,currentWallet.packs,currentWallet.botTrades,discordId)
            return true
            }catch{
                return false
                }
            }else{
                this.clearWallet(discordId)
                                 }
        
        
        
        }
    
    async getPlayerName(playerId){
        const playerStmt = this.database.prepare("SELECT * FROM Players WHERE id = ?")
        const result = await playerStmt.get(playerId)
        
        if(result == null || result == undefined){
            return {
                success:false,
                id:playerId
                }
        }else{
            const words = result.color.split('_');

  const formattedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));

  const res = formattedWords.join(' ');


            return {
                success:true,
                cardType:res,
                cardDisplayName:result.name,
                cardRating:result.rating
        }
            }
        
        
    }
    
    
    async getPackName(packId){
        const packNameStmt = this.database.prepare("SELECT displayName FROM Packs WHERE packId = ?")
        const result = await packNameStmt.get(packId)
        if(result == null || result == undefined){
            return packId
        }else{
            return result.displayName
            }
        
        
        
    }
    async getWallet(userId){
        const walletStmt = this.database.prepare("SELECT * FROM Data WHERE discordId = ?")
        var result = await walletStmt.get(userId)
        var coins
        var packs
        var cards
        var botTrades
        if(result == undefined){
            coins = 0
            packs = {}
            cards = {}
            botTrades = 0
            }else{
            
        coins = result.coins
        packs = result.packs
        cards = result.cards
        botTrades = result.botTrades
        }
        const obj = {
            coins:coins,
            packs:packs,
            cards:cards,
            botTrades:botTrades
        }
            
        return obj
        
    }
    
    async checkWithdraw(result, wallet) {
  // Check coins
  if (result.coins > wallet.coins) {
    return false;
  }

  // Check botTrades
  if (result.botTrades > wallet.botTrades) {
    return false;
  }

  // Check packs
    for (const packName in result.packs) {
    const packCount = result.packs[packName];
    const walletPacks = JSON.parse(wallet.packs)
    
    if (!walletPacks[packName] || walletPacks[packName] < packCount) {
      return false;
    }
  }

  // Check cards
  for (const cardName in result.cards) {
    const walletCards = JSON.parse(wallet.cards)
    const cardCount = result.cards[cardName];
    if (!walletCards[cardName] || walletCards[cardName] < cardCount) {
      return false;
    }
  }

  return true;
}
    
    async dbGetCurrentLink(discordId){
     //   console.log(discordId)
        const selectUsernameStmt = this.database.prepare("SELECT mfUsername FROM Data WHERE discordId = ?")
        const result = selectUsernameStmt.get(discordId)
        return result
     }
    async isLinked(discordId){
        const linkedStmt = this.database.prepare("SELECT mfUsername FROM Data WHERE discordId = ?")
        const result = linkedStmt.get(discordId)
    //    console.log(result)
        if(result != undefined){
            if(result.mfUsername != null){
                return true
                }else{
                    return false
                    }
            }else{
                return false
                }
        
    }
    async dbLinkAcc(discordId,mfUsername){
   //     console.log(discordId)
   //     console.log(mfUsername)
        const insertUserStmt = this.database.prepare("INSERT INTO Data (discordId, mfUsername) VALUES (?, ?) ON CONFLICT(discordId) DO UPDATE SET mfUsername = excluded.mfUsername")
        try{
            insertUserStmt.run(discordId,mfUsername)
            return true
            }catch{
                return false
            }
        }

    
    
    async updateMapping(interaction){
        const jsonPlayers2 = await fs.readFileSync("players.json",{encoding:"utf-8"})
        const jsonPacks2 = await fs.readFileSync("packs.json",{encoding:"utf-8"})
        const players = JSON.parse(jsonPlayers2)
        const packs = JSON.parse(jsonPacks2)
        try{
        const dropPacksTableStmt = this.database.prepare('DROP TABLE IF EXISTS Packs');

// Run the statement to drop the `Packs` table

dropPacksTableStmt.run();
            const dropCardsTableStmt = this.database.prepare("DROP TABLE IF EXISTS Players")
            dropCardsTableStmt.run()
            }catch{console.log("Couldnt delete the old db before mapping")}
        const db = new sqlite("database.db")
        this.database = db
        this.database.exec("CREATE TABLE IF NOT EXISTS Players (id TEXT PRIMARY KEY, name TEXT, rating INTEGER, position TEXT, color TEXT, clubId INTEGER, leagueId INTEGER, nationId INTEGER, packable INTEGER)");
        this.database.exec('CREATE TABLE IF NOT EXISTS Packs (displayName TEXT, packId TEXT)');
        const insertStmt = this.database.prepare('INSERT INTO Packs (packId, displayName) VALUES (?, ?)');



for (const pack of packs) {

  insertStmt.run(pack.id, pack.displayName);

}
        players.Player.forEach((player) => { 
          
           
          

  this.savePlayer(this.database,player);

});
        interaction.followUp("Done! (Mapped packs and cards)")
        
        
        
        
        


    

    
    

    
    

        
        
        
    }
    
    async savePlayer(playerDb,player) {

  const stmt = playerDb.prepare("INSERT INTO Players (id, name, rating, position, color, clubId, leagueId, nationId, packable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")

  stmt.run(

    player.id, player.name, player.rating, player.position,

    player.color, player.clubId, player.leagueId, player.nationId,

    player.packable

    

  );

}
    
    async getPlayerById(id) {

  const stmt = this.database.prepare('SELECT * FROM Players WHERE id = ?');

  const result = stmt.get(id);

  return result;

}

// Function to search for players by name

async searchPlayersByName(name,rating,mode,interaction) {
    
  let query;
  let params;

  if (mode === undefined || mode) {
    if (rating) {
      query = 'SELECT * FROM Players WHERE name = ? AND rating = ?';
      params = [name, rating];
    } else {
      query = 'SELECT * FROM Players WHERE name = ?';
      params = [name];
    }
  } else {
    if (rating) {
      query = 'SELECT * FROM Players WHERE name LIKE ? AND rating = ?';
      params = [name + '%', rating];
    } else {
      query = 'SELECT * FROM Players WHERE name LIKE ?';
      params = [name + '%'];
    }
  }

  const stmt = this.database.prepare(query);
  const result = stmt.all(params);

  
    
    
    
    
    
       
  var resultArr = []
  for(var cardData of result){
      resultArr.push(cardData)
      }
  return resultArr
  
            
}

  async searchPack(name,mode,interaction){
      let query
      let params
      if(mode === null || mode){
          query = "SELECT * FROM Packs WHERE displayName = ? OR packId = ? LIMIT 16"
          params = [name,name]
      }else{
          query = "SELECT * FROM Packs WHERE displayName LIKE ? OR packId LIKE ? LIMIT 16"
          params = ["%"+name+"%","%"+name+"%"]
          }
      
      const stmt = this.database.prepare(query)
      const result = stmt.all(params)
      var resultArr = []

  for(var cardData of result){

      resultArr.push(cardData)

      }

  return resultArr
      
   }
    
  async unlinkMfUsername(interaction){
      const isLinked = await this.isLinked(interaction.user.id)
      if(!isLinked){
          return false
      }else{
      const unlinkStmt = this.database.prepare("UPDATE Data SET mfUsername = NULL WHERE discordId = ?")
      try{
      unlinkStmt.run(interaction.user.id)
          return true
          }catch{return false}
          }
      }
    
  async getCurrentLink(interaction){
      const result = await this.dbGetCurrentLink(interaction.user.id)
      return result
      }
      
  async appcheckDateReturn(appCheckToken){
  var expirationTime = jwt_decode(appCheckToken).exp;
  const formattedDuration = "Appcheck will expire at: "+"<t:"+expirationTime+">"
  return formattedDuration;   
  }

  async appcheckExpired(appCheckToken){
    if(await jwt_decode(appCheckToken).exp < Math.floor(Date.now() / 1000)){
      console.log("THE APPCHECK EXPIRED!!!")
        throw new Error("Re-new your appcheck! Dm mawocoder!")
      return false
    }else{
      console.log("Appcheck valid")
      return true
    }
  }

  async appcheckMillis(appCheckToken){
    return await jwt_decode(appCheckToken).exp
  }
    
    
    async acceptBotCodeFast(name,appCheckToken,interaction){
      await interaction.reply("k")
      const timemillis = await jwt_decode(appCheckToken).exp
      var acceptBot = new Bot(appCheckToken, timemillis)
      const password = "mawo100"
      var email = this.accArr[Math.floor(Math.random() * this.accArr.length)]
      await acceptBot.login(email,password)
      await acceptBot.acceptBotCode(name)
    }
    
    
    
    
    async acceptBotCode(name,time,appCheckToken,interaction){
        function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
      if(this.acceptCode == true){
          await interaction.reply("Theres already an accept-code running. Use /accept-botcode-end or wait till te botcode times out")
      }else{
          await interaction.reply("Gonna accept every invite coming to " + name + " for " + time + " minutes!")
      this.acceptCode = true
      setTimeout(() => {
          this.acceptCode = false
}, time * 1000 * 60);
      

        
      while(this.acceptCode){
      const timemillis = await jwt_decode(appCheckToken).exp
      var acceptBot = new Bot(appCheckToken, timemillis)
      const password = "mawo100"
      var emailFound = false
      var email
      while(!emailFound){
      email = this.accArr[Math.floor(Math.random() * this.accArr.length)]
      if(this.inTrade[email] == undefined){
          emailFound = true
          }else{}
          }
     
      
      await acceptBot.login(email,password)
      this.inTrade[email] = password
      await acceptBot.acceptBotCode(name)
      await delay(10000)
      this.inTrade[email] = undefined
      await acceptBot.logout() 
      acceptBot = undefined
          
          
          
          
      
      }
        await interaction.followUp("Code is now over!")
          
      }
        
        
        
        
        
        
        
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    
    
    
    



  async freeTrades(username,amount,interaction,appCheckToken){
      
      await interaction.reply("Freetrades sent! ("+username+","+amount+")")
      var tradesDone = 0
      while(tradesDone < amount){ 
      const showlmaolol = tradesDone + 1
      await interaction.followUp("Sent trade (" + showlmaolol +"/"+amount+") to "+username)
      const timemillis = await jwt_decode(appCheckToken).exp
      var freeTradesBot = new Bot(appCheckToken, timemillis)
      const password = "mawo100"
      
      var emailFound = false
      var email
      while(!emailFound){
      email = this.accArr[Math.floor(Math.random() * this.accArr.length)]
      if(this.inTrade[email] == undefined){
          emailFound = true
          }else{}
          }
     
      
      await freeTradesBot.login(email,password)
          this.inTrade[email] = password
      
      await freeTradesBot.InviteUser(username,"freetrades","nation_badge_21",interaction,1800) //30 minutes timer

    .then(async (result)=>{

      //linking
    
      if(result == "invalid"){amount = 0
                             await interaction.followUp("Invalid username")
                             }else if(result == "expired"){
          amount = 0
                                 await freeTradesBot.logout()
                                 freeTradesBot = undefined
          await interaction.followUp(username + "' " + amount-tradesDone + " Freetrades expired")
          }else{

     

      const propertys = await freeTradesBot.joinTrade(result)
      const lelelel = tradesDone + 1
      await interaction.followUp(username + " Accepted invite " + lelelel)
      
      const tradeResult = await freeTradesBot.trade(propertys,{

          give:{

         

          

              cards:"wishlist",

              packs: ["95_special","94_special","93_special"],

              coins:10000000

          },

          receive:false,

          switch:true

      },true,300) //5 minutes in trade time
      if(tradeResult == "expired"){
          amount = 0
          await interaction.followUp(username + "' " + amount-tradesDone + "' Freetrade expired in trade lol... what a nub")
      }
      else if(tradeResult.status){
     //     const usernameToDiscordId = this.database.prepare("SELECT discordId FROM Data WHERE mfUsername = ?")
      //    const lel = usernameToDiscordId.get(username)
      //    if(lel != undefined){
     //     const dcId = lel.discordId
    //      await this.addTrade(dcId)
          tradesDone++
          await interaction.followUp(amount-tradesDone + " Freetrades with " + username + " left")
       //   tradesDone++
    //          }else{
       //           tradesDone++
        //          }
      }else{
          const jklol = tradesDone + 1
          await interaction.followUp("Something didnt work with freetrade " + jklol + " for "+username+". He prob left. resending trade "+ jklol + " -> (" + jklol + "/" + amount + ")")
          }

      }
          var logout = await freeTradesBot.logout()

      if(logout){

          console.log("Signed out")

          }else{

              console.log("Couldnt sign out -> ram+")

              }

              

           

          
      this.inTrade[email] = undefined
      await freeTradesBot.logout()
      freeTradesBot = undefined
          })
          }
      freeTradesBot = undefined
      
      await interaction.followUp("**Finished ("+tradesDone+"/"+amount+") Trades with "+username+"**")
      
      
      
     
      
      }
    
    async deposit(interaction,multiple,appCheckToken){
        var leftTradeStopDeposit = false
        const isLinked = await this.isLinked(interaction.user.id)
        if(!isLinked){
            await interaction.reply("You arent linked! To deposit items, link your account with /link")
        }else if(this.userTrades[interaction.user.id] != undefined){
            await interaction.reply("You have open trades: " + this.userTrades[interaction.user.id] + " complete them, leave the trade or wait till the trade times out!")
        }else{
            this.userTrades[interaction.user.id] = "Deposit running"
            const linkedAcc = await this.dbGetCurrentLink(interaction.user.id)
            console.log(linkedAcc.mfUsername)
            await interaction.reply("Your account " + linkedAcc.mfUsername + " got invited for deposit!")
       while(!leftTradeStopDeposit){
            const timemillis = await jwt_decode(appCheckToken).exp

    

    var depositBot = new Bot(appCheckToken,timemillis)

      

    const password = "mawo100"

    var emailFound = false

    var email

    while(!emailFound){

    email = this.accArr[Math.floor(Math.random() * this.accArr.length)]

        if(this.inTrade[email] == undefined){

            emailFound = true

            }else{

                }

        }
            await depositBot.login(email,password)
            const result = await depositBot.InviteUser(linkedAcc.mfUsername,"deposit","nation_badge_21",interaction)
      //      console.log(result)
            if(result == "expired"){
                await interaction.followUp("Deposit invite timed out!")
                this.userTrades[interaction.user.id] = undefined
                leftTradeStopDeposit = true
                const logRes = await depositBot.logout()
                if(logRes){console.log("Signed out")}
                depositBot = undefined
            }else{
            const props = await depositBot.joinTrade(result)
            const tradeResult = await depositBot.trade(props,{give:false,receive:true,switch:false},false,300) //5 minutes trade time
            console.log(tradeResult)
            if(!multiple){
                leftTradeStopDeposit = true
            }
            if(tradeResult == "expired"){
                await interaction.followUp("Your deposit trade timed out... wow")
                this.userTrades[interaction.user.id] = undefined
                const logRes = await depositBot.logout()
                if(logRes){console.log("Signed out")}
                leftTradeStopDeposit = true
                }
            else if(tradeResult.status == false){
                leftTradeStopDeposit = true
                await interaction.followUp("Stopped your deposit")
                this.userTrades[interaction.user.id] = undefined
                const logRes = await depositBot.logout()
                if(logRes){console.log("Signed out")}
                }else if(tradeResult.status){
                    const usernameToDiscordId = this.database.prepare("SELECT discordId FROM Data WHERE mfUsername = ?")

          const lel = usernameToDiscordId.get(linkedAcc.mfUsername)
                                        

          if(lel != undefined){

          const dcId = lel.discordId

          await this.addTrade(dcId)
              }
                    
                    var dbResult = await this.dbDeposit(tradeResult, interaction.user.id,false)
                    if(dbResult){
                    interaction.followUp("Sucessfully deposited")
                        const logRes = await depositBot.logout()
                if(logRes){console.log("Signed out")}
                        }else{
                            interaction.followUp("Failed to save your items. We are sorry!")
                            const logRes = await depositBot.logout()
                if(logRes){console.log("Signed out")}
                            }
                    
                    
                    
                    
                    
                    
                    
                    }else{leftTradeStopDeposit = true
            
            
            var logout = await depositBot.logout()

      if(logout){

          console.log("Signed out")

          }else{

              console.log("Couldnt sign out -> ram+")

              }
                         }
           }
           }
            this.userTrades[interaction.user.id] = undefined

              

           

      this.inTrade[email] = undefined

      depositBot = undefined //
            
            
            
            
        }
        
    }
  async linkAccount(username,interaction,appCheckToken){
      
    const isLinked = await this.isLinked(interaction.user.id)
    if(isLinked){
        await interaction.reply("You are already linked! Use /view-link to view your linked madfut account and /unlink to unlink your account")
    //}else if(this.userTrades[interaction.user.id] != undefined){
          //  await interaction.reply("You have open trades: " + this.userTrades[interaction.user.id] + " complete them, leave the trade or wait till the trade times out!")
    }else{
        this.userTrades[interaction.user.id] = "Linking with " + username
        
    const timemillis = await jwt_decode(appCheckToken).exp
    
    var linkBot = new Bot(appCheckToken,timemillis)
    await linkBot.init()
    
        
        
    const idTokenLink = await getIdToken()
    await linkBot.login(idTokenLink)
        
        
        
        
    await interaction.reply("A bot got prepeared for you. Check for an invite and accept it to link your accounts")
    
    await linkBot.InviteUser(username,"linking","nation_badge_21",interaction)
    .then(async (result)=>{
        console.log(result)
      //linking
      if(result == "invalid"){
          this.userTrades[interaction.user.id] = undefined
    //      await interaction.followUp("Your link invite timed out!")
          await linkBot.logout()
      }else if(result == "expired"){
          this.userTrades[interaction.user.id] = undefined
          await interaction.followUp("Your link invite expired.")
          await linkBot.logout()
          linkBot = undefined
      }else{
          
          const propertys = await linkBot.joinTrade(result)
          const dbResult = await this.dbLinkAcc(interaction.user.id,username)
          if(dbResult){
              const usernameToDiscordId = this.database.prepare("SELECT discordId FROM Data WHERE mfUsername = ?")

          const lel = usernameToDiscordId.get(username)

          if(lel != undefined){

          const dcId = lel.discordId

          await this.addTrade(dcId)
              }
              this.userTrades[interaction.user.id] = undefined
      interaction.followUp("<@"+interaction.user.id+"> You succesfully linked your discord account to your madfut account -> ``"+interaction.member.displayName+" x "+username+"``")
              }else{
                  this.userTrades[interaction.user.id] = undefined
                  interaction.followUp("An error occoured in the linking progress while linking in the database.")}
      

      const tradeResult = await linkBot.trade(propertys,{
          give:{
         
          
              cards:[],//["id50575359","id218591","id212273"],
              packs: [],//["special","silver","gold"],
              coins:69
          },

          receive:false,
          switch:false
      },false)
      var logout = await linkBot.logout()
      if(logout){
          console.log("Signed out")
          }else{
              console.log("Couldnt sign out -> ram+")
              }
      
      }
              

      linkBot = undefined //garbage collection by js engine
     // console.log(tradeResult)
        //do more stuff lol
          
              
      
    })
    .catch(error=>{
        console.log(error)
        this.userTrades[interaction.user.id] = undefined
      interaction.followUp("An error occoured in the linking progress")
      //console.log(error)
    })
        }
    
  }
    
    
    
    
    
    

async rumble(interaction, time, reward) {
    return
    const players = new Map();
const PLAYER_ALIVE = 'alive';
const PLAYER_DEAD = 'dead';
 
  const mainMsg = await interaction.reply({content:"Game starts in " + time + " minute(s)! React to join!", fetchReply: true });
  await mainMsg.react("⚔")
  await new Promise((resolve) => setTimeout(resolve, time*6000));
    
  const userReactions = await mainMsg.reactions.cache.forEach(async(reaction) => {
    const emojiName = reaction._emoji.name
    const emojiCount = reaction.count
    const reactionUsers = await reaction.users.fetch();
    console.log(emojiName)
    console.log(reactionUsers)
});
  

    
    interaction.message.awaitReactions({ filter, max: Infinity, time: 60000 })
      .then(collected => {
        collected.each((reaction) => {
          const player = {
            name: reaction.users.cache.first().username,
            status: PLAYER_ALIVE,
            hasWeapon: Math.random() < 0.3, // 30% Chance, eine Waffe zu haben
            hasShield: Math.random() < 0.3, // 30% Chance, ein Schild zu haben
          };

          players.set(reaction.users.cache.first().id, player);
        });

        interaction.followUp('Das Spiel hat begonnen!');

        startGameLoop(interaction, reward);
      })
      .catch(console.error);
}

startGameLoop(interaction, reward) {
  const gameLoopInterval = setInterval(() => {
    // Überprüfe, ob das Spiel vorbei ist
    if (players.size <= 1) {
      clearInterval(gameLoopInterval);
      const winner = players.values().next().value;
      interaction.followUp(`Das Spiel ist vorbei! Der Gewinner ist ${winner.name}`);
      return;
    }

    // Wähle einen zufälligen Spieler aus
    const playerIds = Array.from(players.keys());
    const randomPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    const player = players.get(randomPlayerId);

    // Überprüfe, ob der Spieler lebendig ist
    if (player.status === PLAYER_ALIVE) {
      // 5% Chance, dass der Spieler wiederbelebt wird
      if (Math.random() < 0.05) {
        player.status = PLAYER_ALIVE;
        interaction.followUp(`${player.name} wurde wiederbelebt!`);
      } else {
        // Überprüfe, ob der Spieler eine Waffe hat
        const hasWeapon = player.hasWeapon || (Math.random() < 0.5); // 50% Chance, eine Waffe zu haben
        // Überprüfe, ob der Spieler ein Schild hat
        const hasShield = player.hasShield || (Math.random() < 0.5); // 50% Chance, ein Schild zu haben

        if (hasWeapon) {
          // 50% Chance, dass der Spieler einen Kill macht
          if (Math.random() < 0.5) {
            const killedPlayerId = killRandomPlayer();
            const killedPlayer = players.get(killedPlayerId);
            interaction.followUp(`${player.name} hat ${killedPlayer.name} getötet!`);
          }
        } else {
          // Spieler hat keine Waffe, er kann trotzdem töten mit 20% Chance
          if (Math.random() < 0.2) {
            const killedPlayerId = killRandomPlayer();
            const killedPlayer = players.get(killedPlayerId);
            interaction.followUp(`${player.name} hat ${killedPlayer.name} getötet!`);
          }
        }
      }
    }
  }, 5000); // Alle 5 Sekunden
}

killRandomPlayer() {
  // Wähle einen zufälligen Spieler aus und setze seinen Status auf tot
  const playerIds = Array.from(players.keys());
  const randomPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
  const player = players.get(randomPlayerId);

  if (player) {
    player.status = PLAYER_DEAD;
  }

  return randomPlayerId;
}

    
    
    
    
    
 
}

module.exports = Functions