const path = require('path');

module.exports = {
  port: 8080,
  root: path.join(__dirname, '..'),
  dist: path.join(__dirname, '..', 'dist'),
  cookies: {
    secret: 'V1St[GX!R8_Z5jdHi6:B-myT',
    session: { key: 'sid' },
    csrf: { key: 'csrf' },
    remember: {
      key: 'remember_me',
      cookie: { path: '/', httpOnly: true, signed: true, maxAge: 604800000 } // maxAge: 7 days
    }
  },
  redis: {
    host: 'localhost',
    port: 6379,
    prefix: 'reactfullstack'
  },
  mongodb: {
    host: 'localhost',
    port: 27017,
    db: 'reactfullstack'
  }
};
