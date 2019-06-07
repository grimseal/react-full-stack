import config from 'config';
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import DbService from 'server/services/DbService';
import routes from 'server/common/routes';
import cookie from 'server/middleware/cookie';
import session from 'server/middleware/session';
import passport from 'server/middleware/passport';
import csrf from 'server/middleware/csrf';
import docs from 'server/middleware/docs';

const server = express();

server.use(helmet());

server.use(express.static('dist'));
server.use(express.static('public'));

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.use(cookie);
server.use(session);

server.use(passport.initialize);
server.use(passport.session);
server.use(passport.rememberMe);

server.use(csrf.initialize);
server.use(csrf.tokenPerSession);

if (process.env.NODE_ENV === 'development') server.use(docs);

routes.apply(server);

// eslint-disable-next-line no-unused-vars
server.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({
    message: err
  });
});

DbService.init().then(() => {
  server.listen(config.port, () => console.log(`Listening on port ${config.port}`));
}, console.error);
