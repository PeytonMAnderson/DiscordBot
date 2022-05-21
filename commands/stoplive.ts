import { ICommand } from "wokcommands";

export default {
    category: 'Configuration',
    description: 'Adds red dot 🔴 to show live channel!',
    
    callback: ({ message }) => {
        let voiceChannelName = message.member?.voice.channel?.name
        if (!voiceChannelName) {
            
            message.reply('No voice channel detected! (Wait for discord to update status and try again)')

        } else {
            
            let   newName = voiceChannelName.replace('🔴', '')
            message.member?.voice.channel?.setName(newName)
            message.reply('Your new Voice Channel name is: ' + newName + '. If the channel did not update please wait 10+ minutes to take effect! (Possible Update Limit Hit!)')
        
        }
    },
} as ICommand