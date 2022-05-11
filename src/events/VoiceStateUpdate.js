const RoxanneEvent = require('../abstract/RoxanneEvent.js');

// TODO: when you move the bot either manually or with /move the state is not updated
// causing the logic to freeze and not track until you rejoin after the song ends
class VoiceStateUpdate extends RoxanneEvent {
    get name() {
        return 'voiceStateUpdate';
    }

    get once() {
        return false;
    }

    get enabled() {
        return true;
    }

    async run(oldState, newState) {
        let guildID = newState.guild.id;
        const _state = {};
        if (oldState.channel === null && newState.channel !== null) _state.type = 'joinEvent';
        if (oldState.channel !== null && newState.channel === null) _state.type = 'leaveEvent';
        if (oldState.channel !== null && newState.channel !== null) return; // moveEvent
        if (oldState.channel === null && newState.channel === null) return; // make sure both events not Null
        const activeQueue = this.client.queue.get(guildID) ?? null;
        const player = activeQueue?.player.connection ?? null;

        // if activeQueue is null dont do anything
        if (!activeQueue && !player) return;

        // check if the bot's voice channel is involved (return otherwise)
        // explicitly assign only the oldState to remember the channel
        _state.channel = oldState.channel;
        if (!_state.channel || _state.channel?.id !== player?.channelId) return;

        // filter current users in vc for bot user
        _state.members = _state.channel.members.filter((member) => !member.user.bot);
        // console.log(_state.members);

        switch (_state.type) {
            case 'leaveEvent':
                console.log('fired event for leaving');
                if (_state.members.size === 0) activeQueue.queue.length = 0;
                activeQueue.repeat = 'off';
                activeQueue.stopped = true;
                this.client.queue.delete(guildID);
                activeQueue.player.connection.disconnect();
                activeQueue.player.stopTrack();
                break;
        }
    }
}
module.exports = VoiceStateUpdate;
