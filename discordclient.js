 var Discord = require("discord.js");
 var bot = new Discord.Client();
 var input = require("input");
 var accounts = require("./accs.json");
 var fs = require("fs");
 let token;
 var chatchannelDefined;
 var version = "Alpha v0.5";



 async function auth() {
     console.clear();
     if(accounts.length===0) {
        console.log("No accounts present, creating a new one");
        token = await input.text("Token (ONLY USED TO LOGIN, won't share anywhere)");
        account = {"token":token,"botCheck":true};
     } else {
         var accountList = accounts.map(a=>a.username+"#"+a.discrim);
         accountList.push("New..");
        account = await input.select("Select an account", accountList);
        if(account !== "New..") {
            account = accounts.find(function(element) {
                return element.username+"#"+element.discrim === account;
            });
            token = account.token;
        } else {
            console.log("Creating new account!");
            token = await input.text("Token (ONLY USED TO LOGIN, won't share anywhere)");
            account = {"token":token};
        }
     }
 console.log("Logging in...")
 await bot.login(token);
 }

 async function ready() {
    console.log("Logged in!");
	if(account["username"] === undefined) {
        var save = await input.confirm("Save account?");
       if(save) {
       console.log("Setting up account..");
       account["username"] = bot.user.username;
       account["discrim"] = bot.user.discriminator;
       account["id"] = bot.user.id;
       accounts.push(account);
       console.log("Saving account..");
       fs.writeFile("./accs.json", JSON.stringify(accounts));
       console.log("Done!");
   }}
   
    if(account["botCheck"] === undefined) {
      account["botCheck"] = true;
	  if(!account["username"] === undefined) {
	  fs.writeFile("./accs.json", JSON.stringify(accounts));
	  }
    }
    
    if(!bot.user.bot && account.botCheck) {
        console.log("I'm sorry, but you aren't a bot! Here theres only bots allowed.\nIf you want more info, read the official discord TOS. It is stated that you cannot modify and/or make a new client. This does not count for bots, though.\nIf you still wish to break the TOS and use the client as a normal user, read the \"How to login as a user\" section in the GitHub wiki.");
        process.exit();
    }

   
    if(account["username"] === undefined) {
        var save = await input.confirm("Save account?");
       if(save) {
       console.log("Setting up account..");
       account["username"] = bot.user.username;
       account["discrim"] = bot.user.discriminator;
       account["id"] = bot.user.id;
       accounts.push(account);
       console.log("Saving account..");
       fs.writeFile("./accs.json", JSON.stringify(accounts));
       console.log("Done!");
   }} else {
       console.log("Welcome back, "+account.username);
   }
    console.log("Starting Discord.Console "+version+"!!!");
    mainMenu();
 }

 bot.on("ready", ready);

 async function mainMenu() {
     console.clear();
     console.log("Logged in as "+account.username+"#"+account.discrim);
    var option = await input.select("Discord.Console "+version+" Main Menu", ["Go to chat!","DMs","Switch account","Quit"]);
    switch(option) {
        case "Go to chat!":
        selectChannel();
        break;
        case "DMs":
        selectUser();
        break;
        case "Switch account":
        bot.destroy();
        auth();
        break;
        case "Account options":
        accOptions();
        break;
        case "Quit":
        process.exit();
        break;
    }
 }

 async function selectChannel() {
     console.clear();
     var guildsmap = ["Switch to User search","Skip to channel ID","Search","Quit"];
     bot.guilds.map(ch=>ch.name+" - "+ch.id).forEach(function(element){
        guildsmap.push(element);
     });
     var guildId = await input.select("What guild do you want to look for channels in?", guildsmap)
     switch(guildId) {
         case "Skip to channel ID":
        var channelId = await input.text("Write the Channel ID here.")
         if(bot.channels.get(channelId) === undefined) {
            console.log("Wrong channel ID, restarting process")
            selectChannel()
        } else {
            console.log("Selected #"+bot.channels.get(channelId).name+"! Getting ready to chat..")
            chat(channelId)
        }
        break;
        case "Quit":
            console.log("Returning to main menu...")
            mainMenu()
            break;
        case "Switch to User search":
            console.log("Time for user search!")
            selectUser()
            break;
        default:
        if(guildId === "Search") {        
        var guildSearch = await input.text("Write the guild name/id to search for. -startover to start over.")
                if(guildSearch === "-startover") {
                    selectChannel()
                } else {
                    var guildSearchList = bot.guilds.array().filter(g=>(g.name+g.id).toLowerCase().includes(guildSearch.toLowerCase()))
                    var guildId = ["Start over"]
                    guildSearchList.map(g=>g.name+" - "+g.id).forEach(function(element){
                        guildId.push(element)
                    })
                    var guildId = await input.select("Which search result?", guildId)
                }
            }
        
            
            guildId = bot.guilds.find(function(element) {
                return element.name+" - "+element.id === guildId
            })
            
            var channelmap = ["Start over"]
            guildId.channels.filter(ch=>ch.type === "text").map(ch=>ch.name+" - "+ch.id).forEach(function(element){channelmap.push(element)})
            var channelId = await input.select("Select the channel.",channelmap)
            if(channelId === "Start over") {
                selectChannel()
            } else {
                channelId = bot.channels.find(function(element) {
                    return element.name+" - "+element.id === channelId
                })
                console.log("Selected #"+channelId.name+"! Getting ready to chat..")
                chat(channelId.id)
            }
            }
        }

 async function selectUser() {
     var userSearch = await input.text("Write the user and/or discriminator to search for. -quit to quit, -channel to chat in channels/guilds.")
     switch(userSearch) {
         case "-quit":
             mainMenu()
             break;
         case "-channel":
             selectChannel()
             break;
         default:
     var usersSearchList = bot.users.array().filter(u=>(u.username+"#"+u.discriminator).toLowerCase().includes(userSearch.toLowerCase()))
     var usersSearchList2 = usersSearchList.map(u=>u.username+"#"+u.discriminator)
     usersSearchList2.push("Search again!")
     usersSearchList2.push("Quit")
     var userId = await input.select("Who do you want to chat with?", usersSearchList2)
     switch(userId) {
         case "Search again!":
            selectUser()
            break;
         case "Quit":
            mainMenu()
         default:
             userId = bot.users.find(function(element) {
                 return element.username+"#"+element.discriminator === userId
             })
        userChat(userId.id)
    }
 }
}

//The chatting process itself (channels)
 async function chat(channel) {
     console.clear()
     chatchannelDefined = true
     userchannel = {"id":null}
     chatchannel = bot.channels.get(channel)
     console.log("Fetching previous messages...")
     console.log("Making new listener...")
     bot.on("message", msg => {handleChan(msg)})
     console.log("We got it, listening to channel #"+chatchannel.name+"\nType -quit to select a different channel")
     chatchannel.fetchMessages({ limit: 10 })
      .then(messages => console.log(messages.map(m=>"! > "+m.author.username+m.author.discriminator+": "+m.content).reverse().forEach(function(message) {console.log(message)})))
      .catch(console.error);
     while(true) {
     var message = await input.text(">")
     if(message === "-quit") {
       console.log("Quitting...")
         bot.listeners("message").forEach(function(list) {bot.removeListener("message", list)})
         chatchannel = undefined
         selectChannel()
         break;
     } else {
         chatchannel.send(message)
     }
    }
     
 }

//DMs
 async function userChat(user) {
    console.clear()
    chatchannelDefined = true
    userchannel = bot.users.get(user)
    chatchannel = null
    console.log("Making new listener...")
    bot.on("message", msg => {handleDM(msg)})
    console.log("We got it, listening to messages from user "+userchannel.username+"#"+userchannel.discriminator+"\nType -quit to select a different user/channel")
    while(true) {
    var message = await input.text(">")
    if(message === "-quit") {
        console.log("Quitting...")
        bot.listeners("message").forEach(function(list) {bot.removeListener("message", list)})
        userchannel = undefined
        selectUser()
        break;
    } else {
        userchannel.send(message)
    }
   }
    
}

//Handling DM and Channel messages. In functions to waste less CPU when selecting channel/DM
async function handleDM(msg) {
  if(msg.channel.type === "dm") {
    if(msg.author.id === userchannel.id) {
      if(!bot.user.bot) {
         msg.acknowledge()
      }
      if(msg.author.bot) {
         var botTag = " [BOT]"
      } else {
         var botTag = ""
       }
      console.log("\n! > DM "+msg.author.username+"#"+msg.author.discriminator+botTag+": "+msg.content)
    }
  }
}
async function handleChan(msg) {
  if(msg.channel.type === "text") {
    if(msg.channel === chatchannel && msg.author.id !== bot.user.id) {
      if(!bot.user.bot) {
         msg.acknowledge()
     }
     if(msg.author.bot) {
         var botTag = " [BOT]"
      } else {
         var botTag = ""
     }
      console.log("\n! > "+msg.author.username+"#"+msg.author.discriminator+botTag+": "+msg.content)
    }
  }
}

//exit message
 process.on('exit', (code) => {
   if(code === 0) {
     bot.destroy()
     console.log("See you next time!")
   }
 })

 auth()
