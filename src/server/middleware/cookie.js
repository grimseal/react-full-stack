import cookieParser from 'cookie-parser';
import config from 'config';

export default cookieParser(config.cookies.secret);
