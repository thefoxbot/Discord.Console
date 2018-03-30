 var Discord = require("discord.js");
 var bot = new Discord.Client();
 var input = require("input")
 var accounts = require("./accs.json")
 var fs = require("fs")
 let token
 var chatchannelDefined
 var version = "Alpha v0.3"

 async function auth() {
     if(accounts.length===0) {
        console.log("No accounts present, creating a new one")
        token = await input.text("Token (ONLY USED TO LOGIN, won't share anywhere)")
        account = {"token":token}
     } else {
         var accountList = accounts.map(a=>a.username+"#"+a.discrim)
         accountList.push("New..")
        account = await input.select("Select an account", accountList)
        if(account !== "New..") {
            account = accounts.find(function(element) {
                return element.username+"#"+element.discrim === account
            })
            token = account.token
        } else {
            console.log("Creating new account!")
        }
     }
 console.log("Logging in...")
 await bot.login(token)
 }

 async function ready() {
    console.log("Logged in!")
    //This is the code that you want to look for!

    if(!bot.user.bot) {
        console.log("I'm sorry, but you aren't a bot! Here theres only bots allowed.\nIf you want more info, read the official discord TOS. It is stated that you cannot modify and/or make a new client. This does not count for bots, though.\nIf you still wish to break the TOS and use the client as a normal user, read the \"How to login as a user\" section in the GitHub wiki.")
        exit()
    }

   
    if(account["username"] === undefined) {
        var save = await input.confirm("Save account?")
       if(save) {
       console.log("Setting up account..")
       account["username"] = bot.user.username
       account["discrim"] = bot.user.discriminator
       account["id"] = bot.user.id
       accounts.push(account)
       console.log("Saving account..")
       fs.writeFile("./accs.json", JSON.stringify(accounts))
       console.log("Done!")
   }} else {
       console.log("Welcome back, "+account.username)
   }
    console.log("Starting Discord.Console "+version+"!!!")
    mainMenu()
 }

 bot.on("ready", ready)

 async function mainMenu() {
    var option = await input.select("Discord.Console "+version+" Main Menu", ["Go to chat!","DMs","Switch account","Quit"])
    switch(option) {
        case "Go to chat!":
        selectChannel()
        break;
        case "DMs":
        selectUser()
        break;
        case "Switch account":
        auth()
        break;
        case "Account options":
        accOptions()
        break;
        case "Quit":
        exit()
        break;
    }
 }

 async function selectChannel() {
     console.log(bot.guilds.map(ch=>"\n"+ch.id+" - "+ch.name))
     var guildId = await input.text("Write the Guild ID here to select the guild you want to chat in, or type -skip to skip to the channel id selection. Type -quit to quit. Type -user to chat with a user instead!")
     if(guildId === "-skip") {
        var channelId = await input.text("Write the Channel ID here.")
        if(bot.channels.get(channelId) === undefined) {
            console.log("Wrong channel ID, restarting process")
            selectChannel()
        } else if(guildId === "-quit") {
            console.log("Returning to main menu...")
            mainMenu()
        } else {
            console.log("Selected #"+bot.channels.get(channelId).name+"! Getting ready to chat..")
            chat(channelId)
        }
     } else {
        if(bot.guilds.get(guildId) === undefined) {
            console.log("Wrong guild ID, restarting process")
            selectChannel()
        } else {
            console.log(bot.guilds.get(guildId).channels.map(ch=>ch.id+" - "+ch.name))
            var channelId = await input.text("Write the Channel ID here. Write -startover to pick a different guild.")
            if(bot.channels.get(channelId) === undefined) {
                console.log("Wrong channel ID, restarting process")
                selectChannel()
            } else {
                console.log("Selected #"+bot.channels.get(channelId).name+"! Getting ready to chat..")
                chat(channelId)
            }
        }
     }
 }

 async function selectUser() {
     var userSearch = await input.text("Write the user and/or discriminator to search for. -quit to quit, -channel to chat in channels/guilds.")
     if(userSearch === "-quit") {
         mainMenu()
     } else if(userSearch === "-channel") {
         selectChannel()
     } else {
     var usersSearchList = bot.users.array().filter(u=>(u.username+"#"+u.discriminator).toLowerCase().includes(userSearch.toLowerCase()))
     console.log(usersSearchList.map(u=>u.username+"#"+u.discriminator+" - "+u.id))
     var userId = await input.text("Get the ID of the user you want to chat with. -startover to start the search over.")
     if(bot.users.get(userId)===undefined) {
         console.log("User not found. Restarting...")
         selectUser()
     } else {
         console.log("User found! Getting ready to chat...")
         userChat(userId)
     }
     }
 }

 async function chat(channel) {
     chatchannelDefined = true
     userchannel = {"id":null}
     chatchannel = bot.channels.get(channel)
     console.log("We got it, listening to channel #"+chatchannel.name+"\nType -quit to select a different channel")
     while(true) {
     var message = await input.text(">")
     if(message === "-quit") {
         chatchannel = undefined
         console.log("Quitting...")
         selectChannel()
         break;
     } else {
         chatchannel.send(message)
     }
    }
     
 }

 async function userChat(user) {
    chatchannelDefined = true
    userchannel = bot.users.get(user)
    chatchannel = null
    console.log("We got it, listening to messages from user "+userchannel.username+"#"+userchannel.discriminator+"\nType -quit to select a different user/channel")
    while(true) {
    var message = await input.text(">")
    if(message === "-quit") {
        userchannel = undefined
        console.log("Quitting...")
        selectUser()
        break;
    } else {
        userchannel.send(message)
    }
   }
    
}

 function exit() {
     console.log("See you next time!")
     bot.destroy()
     process.exit()
 }

 bot.on("message", msg => {
     if(chatchannelDefined) {
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
                 console.log("\n> DM "+msg.author.username+"#"+msg.author.discriminator+botTag+": "+msg.content)
             }
         } else {
             if(msg.channel === chatchannel && msg.author.id !== bot.user.id) {
                 if(!bot.user.bot) {
                     msg.acknowledge()
                 }
                 if(msg.author.bot) {
                     var botTag = " [BOT]"
                 } else {
                     var botTag = ""
                 }
                 console.log("\n> "+msg.author.username+"#"+msg.author.discriminator+botTag+": "+msg.content)
             }
         }
    }
 })

 auth()
