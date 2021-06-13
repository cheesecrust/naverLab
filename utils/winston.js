import winston from 'winston';

const { combine, timestamp, label, printf, metadata } = winston.format;
 
const myFormat = printf(({ level, message, label, meta, timestamp }) => {
  const out = {
    time: timestamp,
    from: label,
    level: level,
    message: message,
    user: meta?.user,
    url: meta?.url,
    runtime: meta?.runtime
  }
  return JSON.stringify(out).replace(/\\n/g, '');
});
 
const options = {
  error: {
    level: "error",
    filename: 'error.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    format: combine(
      metadata({ fillWith: ['user', 'url', 'runtime'], fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      label({ label: 'Error' }),
      timestamp({format: () => new Date().toLocaleString('en-US', {timeZone: "Asia/Seoul"})}),
      myFormat
    )
  },
  file: {
    level: 'info',
    filename: 'log.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    format: combine(
      label({ label: 'Log' }),
      timestamp({format: () => new Date().toLocaleString('en-US', {timeZone: "Asia/Seoul"})}),
      myFormat
    )
  },
  // 개발 시 console에 출력
  console: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    colorize: true,
    format: combine(
      label({ label: 'Debug' }),
      timestamp(),
      myFormat
    )
  }
}
 
let logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.error),
    new winston.transports.File(options.file)
  ],
  exitOnError: false, 
});
 
if(process.env.RUN_ENV !== 'production'){
  logger.add(new winston.transports.Console(options.console))
}
 
export default logger;

