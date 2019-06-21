const { format, loggers, transports } = require('winston')

//
// The `add` method takes a string as a unique id we can later use to retrieve
// the logger we configured. As a second argument it takes an object to
// configure your logger the same way we do with the `createLogger` function.
//
loggers.add('logger', {
    format: format.simple(),
    level: 'debug',
    colorize: true,
    transports: [
        new transports.Console()
    ]
})
const logger = loggers.get('logger')

module.exports = logger;