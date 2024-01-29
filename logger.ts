import logger from 'winston';

const { createLogger, format, transports } = logger;
const winstonLogger = createLogger({
  level: 'debug',
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

export default winstonLogger;