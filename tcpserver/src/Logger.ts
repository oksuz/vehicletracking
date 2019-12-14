import bunyan from 'bunyan';

export default bunyan.createLogger({
  name: 'mototakip-tcp',
  streams: [{
    type: 'raw',
    level: 'trace',
    stream: {
      write: (rec) => { 
        console.log('[%s] %s: %s', rec.time.toISOString(), bunyan.nameFromLevel[rec.level], rec.msg);
      }
    }
  }]
});