import session from 'express-session';
import RedisStore from 'connect-redis';
import config from 'config';
import client from 'server/common/redisClient';

const store = new (RedisStore(session))({
  prefix: `${config.redis.prefix}_session:`,
  client
});

export default session({
  name: config.cookies.session.key,
  secret: config.cookies.secret,
  resave: false,
  saveUninitialized: false,
  store
});
