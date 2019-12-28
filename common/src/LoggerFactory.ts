import bunyan from 'bunyan';
const loggers = {};


function getLogger(name: string) {
  if (loggers[name]) {
    return loggers[name];
  }

  loggers[name] = bunyan.createLogger({
    name: name,
    streams: [
      {
        type: 'raw',
        level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
        stream: {
          write: (rec) => { 
            console.log('[%s] [%s] %s: %s', rec.name, rec.time.toISOString(), bunyan.nameFromLevel[rec.level], rec.msg);
          }
        }
      }
    ]
  });
  
  return loggers[name];
} 

export {
  getLogger
}