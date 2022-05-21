import axios from 'axios'
import { ICommand } from 'wokcommands'

export default {
    category: 'Information',
    description: 'Get request to Twitch',
    permissions: ['ADMINISTRATOR'],

    maxArgs: 1,
    expectedArgs: '<username>',
    expectedArgsTypes: ['STRING'],

    slash: 'both',
    testOnly: false,

    callback: async ({ args }) => {
        let uri = 'https://api.twitch.tv/helix/streams?user_login='
        if (args.length) {
            uri += `${args[0]}`
        } else {
            return 'Please enter a username!'
        }
        try {
            //ACCESS TWITCH API FOR TWITCH USER INFORMATION
            console.log('Twitch  -> Fetching from Twitch for user command (get)')
            let { data } = await axios.get(uri, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + process.env.TWITCH_TOKEN,
                    'Client-Id': process.env.TWITCH_ID || 'NULL',
                    'Content-Type': 'application/json'
                },
            })
            console.log('Twitch  -> Twitch look up: ' + data.data[0].user_name)
            return 'The user: ' + data.data[0].user_name + ' is currently live with ' + data.data[0].viewer_count + ' viewers watching ' + data.data[0].game_name
        
        } catch  {
            return 'The user: ' + args[0] + ' is currently offline!'
        }
    },
} as ICommand