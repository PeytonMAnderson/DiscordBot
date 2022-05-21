import DJS from 'discord.js'
import { ICommand } from "wokcommands";
import streamerSchema from '../models/streamer-schema';

export default {
    category: 'Configuration',
    description: 'Adds Twitch Streamer to list.',

    permissions: ['ADMINISTRATOR'],

    minArgs: 2,
    expectedArgs:'<user> <text>',
    slash: 'both',
    testOnly: false,
    guildOnly: true,

    options: [{
        name: 'user',
        description: 'The target discord user.',
        required: true,
        type: DJS.Constants.ApplicationCommandOptionTypes.USER 
    },
    {
        name: 'text',
        description: 'The target twitch user.',
        required: true,
        type: DJS.Constants.ApplicationCommandOptionTypes.STRING

    }],

    callback: async ({ guild, message, interaction, args}) => {
        if (!guild) {
            return 'Please use this command in a server.'
        }
        const target = message ? message.mentions.users.first() : interaction.options.getUser('user')
        if (!target) {
            return 'Please tag a user in the server.'
        }
        let text = interaction?.options.getString('text')
        if (message) {
            args.shift()
            text = args.join(' ')
        }
        try {
            //ACCESS MONGODB TO UPDATE INFORMATION
            console.log('MongoDB -> Fetching from MongoDB for user command (add)')
            await streamerSchema.findOneAndUpdate({
                _id: guild.id
            }, {
                _id: guild.id,
                userId: target.id,
                lastChannelId: 'NULL',
                text
            }, {
                upsert: true
            })
        } catch {
            console.log('MongoDB -> UNABLE TO ACCESS MONGODB CANNOT EXECUTE USER COMMAND (add)')
            return 'Unable to add the user to the database...'
        }
        return 'User added to database!'
    }
} as ICommand