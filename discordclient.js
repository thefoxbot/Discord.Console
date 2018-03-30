 var Discord = require("discord.js");
 var bot = new Discord.Client();
 var input = require("input")
 var accounts = require("./accs.json")
 var fs = require("fs")
 let token
 var chatchannelDefined
 var version = "Alpha v0.2"

 async function auth() {
     if(accounts.length===0) {
        console.log("No accounts present, creating a new one")
        token = await input.text("Token (ONLY USED TO LOGIN, won't share anywhere)")
        account = {"token":token}
     } else {
         console.log("If it shows \"undefined#undefined\" as an option, you haven't completed the registration for that account yet.")
         var accountList = accounts.map(a=>a.username+"#"+a.discrim)
         accountList.push("New..")
         console.log(accountList)
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
    console.log("Main menu indev, sending you to channel selection")
    selectChannel()
 }

 async function selectChannel() {
     console.log(bot.guilds.map(ch=>"\n"+ch.id+" - "+ch.name))
     var guildId = await input.text("Write the Guild ID here to select the guild you want to chat in, or type -skip to skip to the channel id selection. Type -quit to quit.")
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

 async function chat(channel) {
     chatchannelDefined = true
     chatchannel = bot.channels.get(channel)
     console.log("We got it, listening to channel #"+chatchannel.name+"\nType -quit to select a different channel")
     while(true) {
     var message = await input.text(">")
     if(message === "-quit") {
         chatchannel = undefined
         console.log("Quitting...")
         mainMenu()
         break;
     } else {
         chatchannel.send(message)
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
    if(msg.channel === chatchannel && msg.author.id !== bot.user.id) {
        console.log("\n> "+msg.author.username+"#"+msg.author.discriminator+": "+msg.content)
    }
    }
 })

 auth()