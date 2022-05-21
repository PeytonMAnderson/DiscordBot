import DiscordJS, { Intents } from 'discord.js'
import WOKCommands from 'wokcommands'
import path from 'path'
import mongoose from 'mongoose'
import settingsSchema from './models/settings-schema'
import streamerSchema from './models/streamer-schema'
import axios from 'axios'
import dontenv from 'dotenv'
dontenv.config()

//SET TIME IT TAKES TO CHECK
let startUpTime = new Date()
let checkInMinutes = 6
export { startUpTime, checkInMinutes }

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
})

client.on('rateLimit', (info) => {
    console.log(`Discord -> Rate limit: ${info.path} hit. Timeout: ${info.timeout/1000 + ' seconds' ? info.timeout: 'Unknown timeout '}`)
    checkInMinutes = checkInMinutes + 1
    console.log('Increasing Check Interval to: ' + checkInMinutes + 'minute(s)!')
})

client.on('guildCreate', async (guild) => {
    guild.systemChannel?.send(`Hello, I'm TwitchDot. Thank you for inviting me. Type !help to see my commands! Type !goauto to turn on automatic red dot application!`)
    let cTime = new Date()
    await settingsSchema.findOneAndUpdate({
        _id: guild.id
    }, {
        _id: guild.id,
        autoDot: 'off',
        updateIteration: 0,
        updateTime: cTime
    }, {
        upsert: true
    })
})

client.on('guildDelete', async (guild) => {
    await settingsSchema.deleteOne({_id: guild.id})
    await streamerSchema.deleteOne({_id: guild.id})
})

client.on('error', async (info) => {
    console.log('Discord -> ERROR: ' + info.name + ' Description: ' + info.message)
})

client.on('ready', async () => {
    //BOT STARTED
    console.log('BOT READY!')

    //BOT CONNECT TO MONGO DATABASE
    await mongoose.connect(process.env.MONGO_URI || '', 
    {
        keepAlive: true,
    })
    console.log('MongoDB Connected! -> Updating Interation count for all servers...')

    //SET ALL SERVERS UPDATE ITERATION BACK TO 0
    await settingsSchema.bulkWrite([ 
        {updateMany : 
            {
                "filter": {updateIteration: {$gt: 0}},
                "update": {
                    $set: {
                        updateIteration: 0
                    }
                },
                "upsert":true
            }
        }
    ])
    console.log('MongoDB Connected! -> Updating Interation count for all servers... DONE!')

    //INITIALIZE WOKCOMMANDS
    console.log('WOKCommands -> Initializing WOKCommands...')
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        typeScript: false,
        testServers: ['937180898024112258'],
        botOwners: ['409530259545915402'],
        mongoUri: process.env.MONGO_URI
    })
    console.log('WOKCommands -> Initializing WOKCommands... DONE!')

    console.log('DiscordBot -> Initializing Variables...')
    //INITIALIZE VARIABLES
    let databaseServers = await settingsSchema.count({autoDot: 'on'})
    console.log('DiscordBot -> There are: ' + databaseServers + ' server(s) connected and recieving active polling!')
    databaseServers = databaseServers + 1
    let checkInterval = (checkInMinutes * 60 * 1000) / databaseServers
    console.log('DiscordBot -> Check Time: ' + checkInMinutes + ' minute(s) per server')
    console.log('DiscordBot -> Check Interval: ' + checkInterval/1000 + ' second(s)')
    let uri = 'https://api.twitch.tv/helix/streams?user_login='
    let intervalSince = 0
    let twitchUser = 'NULL'
    let discordId = 'NULL'
    let guildId = 'NULL'
    let discordChannel = 'NULL'
    let forgottenChannel = 'NULL'
    let forgottenName = 'NULL'
    let newgottenName = 'NULL'
    let voiceChannelName = 'NULL'
    let newName = 'NULL'
    let addOrRem = true
    let thisGuild = undefined
    let thisChannel = undefined
    let thisMember = undefined
    console.log('DiscordBot -> Initializing Variables... DONE!')
    
    //FIX NAME OF CHANNEL ON MEMORY IF THERE IS A RED DOT IN IT
    async function fixForgotten() {
        if(forgottenChannel != 'NULL') {
            try {
                thisGuild = undefined
                thisChannel = undefined
                forgottenName = 'NULL'

                thisGuild = await client.guilds.fetch(guildId)
                thisChannel = thisGuild.channels.cache.get(forgottenChannel)
                forgottenName = thisChannel?.name || 'NULL'

                if(forgottenName != 'NULL') {
                    console.log('Discord -> Updating Voice Channel: ' + forgottenName + ' seeing if has dot...')
                    if(forgottenName.startsWith('🔴')  == true) {
                        newgottenName = forgottenName.replace('🔴', '');
                        try {
                            thisChannel?.setName(newgottenName)
                            console.log('Discord -> Updating Voice Channel: ' + newgottenName + ' seeing if has dot...DONE!')
                    
                            //SEE IF USER IS IN A CALL CURRENTLY
                            console.log("DiscordBot -> updating mongoDB...")
                            uploadFixForgotten()
                        } catch {
                            console.log('Discord -> UNABLE TO UPDATE FORGOTTEN CHANNEL NAME')
                        }
                    } else {
                    console.log("DiscordBot -> forgotten name does not contain red dot, updating MongoDB...")
                    uploadFixForgotten()
                    }

                } else {
                console.log("DiscordBot -> UNABLE TO RETREIVE FORGOTTEN CHANNEL NAME")
                }
            } catch {
                console.log('Discord -> UNABLE TO GET FORGOTTEN CHANNEL INFORMATION')
            }
        } else {
            console.log("DiscordBot -> NO FORGOTTEN CHANNEL ON FILE")
        }
    }

    //UPLOAD NEW FORGOTTEN CHANNEL TO MONGODB
    async function uploadFixForgotten() {
        if(discordChannel != 'NULL') {
            console.log('MongoDB -> Updating Forgotten Channel to: ' + discordChannel)
            //ONCE LAST CHANNEL HAS BEEN FIXED, CHANGE MEMORY TO NEW CHANNEL
            try {
                await streamerSchema.findOneAndUpdate({
                    _id: guildId
                }, {
                    lastChannelId: discordChannel,
                }, {
                    upsert: true
                })
            } catch {
                console.log('MongoDB -> UNABLE TO UPDATE MONODB DATABASE')
            }
        } else {
            console.log('MongoDB -> Updating Forgotten Channel to: NULL')
            //ONCE LAST CHANNEL HAS BEEN FIXED, CHANGE MEMORY TO NULL
            try {
                await streamerSchema.findOneAndUpdate({
                    _id: guildId
                }, {
                    lastChannelId: 'NULL',
                }, {
                    upsert: true
                })
            } catch {
                console.log('MongoDB -> UNABLE TO UPDATE MONODB DATABASE')
            }
        }
    }

    //ADD OR REMOVE THE RED DOT IN THE DISCORD CHANNEL
    async function updateRedDot() {
    try {
        voiceChannelName = 'NULL'
        thisGuild = undefined
        thisChannel = undefined
        thisGuild = await client.guilds.fetch(guildId)
        thisChannel = thisGuild.channels.cache.get(discordChannel)
        voiceChannelName = thisChannel?.name || 'NULL'

        console.log('DiscordBot -> Updating Voice Channel Name: ' + voiceChannelName + ' ...')                                
            //SEE IF CURRENT CALL IS ALREADY IN LIVE STATE
            if(addOrRem == true) {
                //IF USER IS IN CALL THAT NEEDS A RED DOT
                if(voiceChannelName != 'NULL' && voiceChannelName.startsWith('🔴')  == false) {
                    console.log('DiscordBot -> Updating Voice Channel Name: ' + voiceChannelName + ' ...adding red dot')
                    newName = '🔴' + voiceChannelName;
                    try {
                        thisChannel?.setName(newName) 
                        console.log('DiscordBot -> Updating Voice Channel Name: ' + voiceChannelName + ' ...DONE!')
                        //AFTER UPDATING NEW CHANNEL, SEE OF FORGOTTEN CHANNEL IS EMPTY, IF IT IS THEN UPLOAD NEW FORGOTTEN CHANNEL
                        if (forgottenChannel == 'NULL')
                        {
                            uploadFixForgotten()
                        }
                    } catch {
                        console.log('Discord -> UNABLE TO UPDATE VOICE CHANNEL NAME')
                    }                    

                //IF USER IS IN CALL THAT DOES NOT NEED A RED DOT, CHECK TO SEE IF FORGOTTEN CHANNEL IS UP TO DATE
                } else if (voiceChannelName != 'NULL' && voiceChannelName.startsWith('🔴')  == true) {
                    console.log('Discord -> Updating Voice Channel: ' + voiceChannelName + ' already has dot, now checking forgotten = current...')
                    if(discordChannel != forgottenChannel) {
                        console.log('Current discord channel: ' + discordChannel + ' does not equal database channel: ' + forgottenChannel + ' checking Forgotten Channel...')
                        fixForgotten()
                    } else {
                        console.log('Current discord channel: ' + discordChannel + ' does equal database channel: ' + forgottenChannel + ' stop checking...')
                    }
                //IF USER IS IN AN UNDEFINED CALL OR NO CALL
                } else {
                    console.log('Discord -> Updating Voice Channel: ' + voiceChannelName + ' UNABLE TO UPDATE, now checking forgotten...')
                    fixForgotten()
                }
            } else {
                //IF USER IS IN VOICE CHANNEL WITH RED DOT THAT NEEDS TO BE REMOVED
                if(voiceChannelName != 'NULL' && voiceChannelName.startsWith('🔴') == true) {
                    newName = voiceChannelName.replace('🔴', '');
                    try {
                        thisChannel?.setName(newName) 
                        console.log('Voice Channel Updated!')
                    } catch {
                        console.log('Discord -> UNABLE TO UPDATE VOICE CHANNEL NAME')
                    }
                //IF USER IS IN VOICE CHANNEL WITH NO RED DOT, CHECK FORGOTTEN INSTEAD
                } else if(voiceChannelName != 'NULL' && voiceChannelName.startsWith('🔴') == false) {
                console.log('Discord -> Updating Voice Channel: ' + voiceChannelName + ' already has dot removed, now checking forgotten = current...')
                    if(discordChannel != forgottenChannel) {
                        console.log('Current discord channel: ' + discordChannel + ' does not equal database channel: ' + forgottenChannel + ' checking Forgotten Channel...')
                        fixForgotten()
                    } else {
                        console.log('Current discord channel: ' + discordChannel + ' does equal database channel: ' + forgottenChannel + ' stop checking...')
                    }
                //IF USER IS IN NO VOICE CHANNEL OR UNDEFINED, CHECK FORGOTTEN INSTEAD
                } else {
                    console.log('Discord -> Updating Voice Channel: ' + voiceChannelName + ' UNABLE TO UPDATE, now checking forgotten...')
                    fixForgotten()
                }
            }
        } catch {
            console.log('Discord -> UNABLE TO ACCESS VOICE CHANNEL NAME')
        }
    }
    console.log('DiscordBot -> Beginning Interval Server Check...')

    //CHECK INTERVAL FOR TWITCH STREAMERS LIVE = ADD RED DOT TO THEIR VOICE CHANNEL
    async function autoRedDot() {
        console.log('--------------------------------')
        console.log("DiscordBot -> IntervalUpdate: " + intervalSince)

        //GET INFORMATION FROM DATABASE
        console.log('MongoDB -> Fetching from Database: Server Settings')
        try {
            thisGuild = undefined
            thisChannel = undefined
            await settingsSchema.findOne({autoDot: 'on', updateIteration: {$lte: intervalSince}}).then(result => {
                guildId = result.id
            })
            console.log('MongoDB -> ServerID: ' + guildId)
            
            //FOUND DISCORD SERVER, NOW GET TWITCH DISCORD USER INFORMATION FROM DATABASE
            thisGuild = await client.guilds.fetch(guildId)
            discordId = 'NULL'
            twitchUser = 'NULL'
            forgottenChannel = 'NULL'

            uri = 'https://api.twitch.tv/helix/streams?user_login='
            try {
                console.log('MongoDB -> Fetching from Database: Streamer Settings')
                await streamerSchema.findOne({ _id: guildId}).then(result => {
                    discordId = result.userId
                    twitchUser = result.text
                    forgottenChannel = result.lastChannelId
                })
                try {
                    discordChannel = 'NULL'
                    thisMember = undefined
                    thisMember = await thisGuild.members.fetch(discordId)
                    let discordUsername = thisMember.displayName

                    console.log('MongoDB -> Twitch Username: ' + twitchUser)
                    console.log('MongoDB -> Discord Username: ' + discordUsername)
                    console.log('MongoDB -> Discord Forgotten Channel: ' + forgottenChannel)
                    
                    discordChannel = thisMember.voice.channelId || 'NULL'
                    console.log('Discord -> Discord Current Channel: ' + discordChannel)

                    //ONCE AQUIRED DATABASE INFORMATION, INCREASE ITERATION FOR THIS SERVER
                    let newInterval = intervalSince + 1
                    console.log('MongoDB -> Updating Server Iteration to: ' + newInterval)
                    let newDate = new Date()
                    await settingsSchema.findOneAndUpdate({
                        _id: guildId
                    }, {
                        updateIteration: newInterval,
                        updateTime: newDate
                    }, {
                        upsert: true
                    })

                    //CHECK IF USER IS IN CALL
                    if(discordChannel === 'NULL') {
                        console.log("DiscordBot -> Discord Channel is NULL")
                        
                        //IF USER IS NO LONGER IN THE CALL, PULL UP LAST CHANNEL FROM DATABASE AND CHECK FOR CIRCLE TO REMOVE
                        console.log("DiscordBot -> Checking previous channel: " + forgottenChannel)
                        fixForgotten()
                    } else {

                        //CHECK IF TWITCH USER ON FILE IS NOT NULL
                        if (twitchUser != 'NULL' && twitchUser != '') {

                        //LOOK UP TWITCH FOR USER IF LIVE
                            uri = uri + twitchUser
                            console.log('Twitch -> Twitch uri: ' + uri)
                            try {
                                console.log('Twitch -> Connecting to Twitch API...')
                                let { data } = await axios.get(uri, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': 'Bearer ' + process.env.TWITCH_TOKEN,
                                        'Client-Id': process.env.TWITCH_ID || 'NULL',
                                        'Content-Type': 'application/json'
                                    },
                                })
                                console.log('Twitch -> Twitch look up: ' + data.data[0].user_name + ' is live and recieved data!')
                                
                                //IF USER IS LIVE ON TWITCH AND IS IN DISCORD CALL, ADD DOT IN DISCORD TITLE
                                try {
                                    addOrRem = true
                                    updateRedDot()
                                } catch {
                                    console.log('DiscordBot -> UNABLE TO UPDATE TITLE EVEN THOUGH TWITCH IS LIVE')
                                }

                            } catch {
                                console.log('Twitch -> Twitch look up: ' + twitchUser + ' IS OFFLINE OR DOES NOT EXIST!')
                                
                                //IF USER IS NOT LIVE OR UNABLE TO READ BUT IS IN DISCORD CALL, REMOVE DOT IN DISCORD TITLE
                                try {
                                    addOrRem = false
                                    updateRedDot()
                                } catch {
                                    console.log('DiscordBot -> UNABLE TO UPDATE TITLE EVEN THOUGH TWITCH IS NOT LIVE')
                                }
                            }
                        } else {
                            console.log("DiscordBot -> TWITCH USER ON FILE IS EMPTY: " + twitchUser)
                        }
                    }
                //IF INFORMATION PROVIDED DOES NOT ALLOW CHANNEL AND USER SEARCHES       
                } catch {
                    console.log('Unable to find user with server id: ' + guildId + ' and user id: ' + discordId)
                }
            //IF INFORMATION PROVIDED DOES NOT ALLOW USER SEARCH 
            } catch {
                console.log('Unable to find server with server id: ' + guildId)
            }
        //IF INFORMATION PROVIDED DOES NOT ALLOW SERVER SEARCH
        } catch {
            //IF NO SERVER EXISTS WITH AUTODOT ENABLED OR EQUAL OR LESS INTERATION, THEN INCREASE ITERATION
            console.log('MongoDB -> Unable to find server with autoDot enabled and interation: ' + intervalSince + ' increasing iteration.')
            intervalSince = intervalSince + 1

            //UPDATE INTERVAL SETTINGS
            console.log('DiscordBot -> Creating new Interval...')
            databaseServers = await settingsSchema.count({autoDot: 'on'})
            console.log('DiscordBot -> There are: ' + databaseServers + ' server(s) connected and recieving active polling!')
            databaseServers = databaseServers + 1
            checkInterval = (checkInMinutes * 60 * 1000) / databaseServers
            console.log('DiscordBot -> Check Time: ' + checkInMinutes + ' minute(s) per server')
            console.log('DiscordBot -> Check Interval: ' + checkInterval/1000 + ' second(s)')
            clearInterval(thisInterval)
            thisInterval = setInterval(autoRedDot, checkInterval)
            console.log('DiscordBot -> Creating new Interval...DONE!')
        }
    }

    //DYNAMIC INTERVAL FOR AUTOMATIC RED DOT APPLICATION
    console.log('DiscordBot -> Starting Interval...')
    let thisInterval = setInterval(autoRedDot, checkInterval)

})

client.login(process.env.TOKEN)