import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import streamerSchema from '../models/streamer-schema';
import settingsSchema from '../models/settings-schema';
import { startUpTime, checkInMinutes } from '../index'

export default {

    category: 'Information',
    description: 'Lists streamer information on file.',

    permissions: ['ADMINISTRATOR'],

    slash: 'both',
    testOnly: false,
    guildOnly: true,

    callback: async ({guild}) => {
        
        let twitchUser = ''
        let discordId = ''
        let lastKnownChannel = ''
        let autoDotSetting = ''
        let currentInteration = 0
        let oldUpdateTime = new Date()
        console.log('MongoDB -> Fetching from database for user command (list)')
        if (!guild) {
            return 'Must be in server!'
        }
        //GET INFORMATION IN TWITCH STREAMERS DOC
        try {
            await streamerSchema.findOne({ _id: guild.id}).then(result => {
                discordId = result.userId
                twitchUser = result.text
                lastKnownChannel = result.lastChannelId  
            })
        } catch {
            console.log('MongoDB -> UNABLE TO FETCH USER COMMAND (list) FOR STREAMER DATA')
            return 'Unable to get information from the database [OR] No streamer user on file. Use: !add <discord_username> <twitch_username>'
        }
        //GET INFORMATION IN SERVER SETTINGS DOC
        try {
            await settingsSchema.findOne({ _id: guild.id}).then(result => {
                autoDotSetting = result.autoDot
                currentInteration = result.updateIteration
                oldUpdateTime = result.updateTime
            })
        } catch {
            console.log('MongoDB -> UNABLE TO FETCH USER COMMAND (list) FOR SETTINGS DATA')
            return 'Unable to get information from the database. Try: !goauto/!stopauto [OR] remove the bot and add it again.'
        }
            let discordUser = guild.members.fetch(discordId)
            let discordName = (await discordUser).user.username
            let discordDisc = (await discordUser).user.discriminator
            let discordChannelName = 'NULL'
            if(lastKnownChannel != 'NULL') {
                discordChannelName = guild.channels.cache.get(lastKnownChannel)?.name || 'NULL'
            }
            let currentInterationString = currentInteration.toString()

            //DATE AND TIME
            let cDate = new Date()
            let fDate = cDate.getTime() - oldUpdateTime.getTime()
            let updateString = ''
            if(fDate/86400000 < 1) {
                if(fDate/3600000 < 1) {
                    if(fDate/60000 < 1) {
                        fDate = fDate/1000
                        updateString = fDate.toFixed() + ' Second'
                        if(fDate >= 2) {
                            updateString = updateString + 's'
                        }
                        updateString = updateString + ' ago'
                    } else {
                        fDate = fDate/60000
                        updateString = fDate.toFixed() + ' Minute'
                        if(fDate >= 2) {
                            updateString = updateString + 's'
                        }
                        updateString = updateString + ' ago'
                    }
                } else {
                    fDate = fDate/3600000
                    updateString = fDate.toFixed() + ' Hour'
                    if(fDate >= 2) {
                        updateString = updateString + 's'
                    }
                    updateString = updateString + ' ago'
                }
            } else {
                fDate = fDate/86400000
                updateString = fDate.toFixed() + ' Day'
                if(fDate >= 2) {
                    updateString = updateString + 's'
                }
                updateString = updateString + ' ago'
            }

        const embed = new MessageEmbed()
        .setDescription("Server Information")
        .setTitle("TwitchDot")
        .setColor("GREEN")
        .addFields([
            {
                name:'🔵Discord: ',
                value: discordName + '#' + discordDisc,
            },
            {
                name:'🟣Twitch: ',
                value: twitchUser,
            },
            {
                name:'🔴 Auto Dot: ',
                value: autoDotSetting,
            },
            {
                name:'Bot Updates Since Start Up: ',
                value: 'Updates: ' + currentInterationString  
            },
            {
                name:'Last Known Discord Voice Channel: ',
                value: discordChannelName,
            },
            {
                name:'Other: ',
                value: 'Bot Start Up Time: ' + startUpTime.toLocaleTimeString('en-us',{timeZoneName:'short'}) + ' ' + startUpTime.toLocaleDateString() +
                        '\n Server Update Interval: ' + checkInMinutes + ' Minutes' +
                        '\nLast Updated: ' + updateString,
            },
        ])
        return embed
    }
} as ICommand