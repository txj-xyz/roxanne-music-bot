const RoxanneEvent = require('../abstract/RoxanneEvent.js');

class Ratelimit extends RoxanneEvent {
    get name() {
        return 'rateLimit';
    }

    get once() {
        return false;
    }

    async run(info) {
        this.client.logger.log(
            this.constructor.name, '\n' +
            `  Route                    : ${info.route}\n` + 
            `  Hash                     : ${info.hash}\n` +
            `  Max Requests             : ${info.limit}\n` + 
            `  Timeout                  : ${info.timeout}ms\n` + 
            `  Global Ratelimit         : ${info.global}`
        );
    }
}
module.exports = Ratelimit;