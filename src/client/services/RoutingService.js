/* eslint-disable class-methods-use-this */
import routes from 'server/common/routes';
import axios from 'axios';
import cookies from 'browser-cookies';

axios.defaults.xsrfHeaderName = 'CSRF-Token';
axios.defaults.xsrfCookieName = 'csrf';

function isSet(value) {
  return value || value === null;
}

// TODO don't fetch data from server for local routes
// TODO implement restriction for local routes where defined variable 'authorized'
// TODO specify a cancel token that will be used to cancel current request if user make another
class RoutingService {
  uiLock = true;

  init(app) {
    if (this.app === app) return;
    this.app = app;
    this.uiLock = false;
    window.onpopstate = () => this.follow(document.location.pathname);
  }

  resolveRoute(url) {
    if (!url) return null;
    const found = Object.values(routes).find(route => {
      if (route.path instanceof RegExp) return route.path.test(url);
      if (typeof route.path === 'string') return url === route.path;
      return false;
    });
    return found || null;
  }

  /**
   * Handler for Link component onClick event
   * @param event
   * @return void
   */
  handleLinkClick(event) {
    event.preventDefault();
    if (this.uiLock) {
      console.warn('ui locked');
      return;
    }
    this.follow(event.target.pathname);
  }

  follow(pathname) {
    window.history.pushState(null, null, pathname);
    this.sendGetRequest(pathname);
  }

  sendGetRequest(pathname) {
    this.uiLock = true;
    axios
      .get(pathname, { responseType: 'json' })
      .then(response => this.handleResponse(response, pathname))
      .finally(() => {
        this.uiLock = false;
      });
  }

  handleRedirect(response) {
    if (!response.data || !response.data.redirect) return false;
    if (isSet(response.data.user)) this.app.setState({ user: response.data.user });
    this.follow(response.data.redirect);
    return true;
  }

  handleResponse(response, pathname) {
    if (this.handleRedirect(response)) return;
    const state = {};
    const { view } = this.resolveRoute(pathname) || {};
    if (view) state.view = view;
    if (response.data) {
      if (isSet(response.data.user)) state.user = response.data.user;
      if (isSet(response.data.data)) state.data = response.data.data;
    }
    this.app.setState(state);
  }

  /**
   * @private
   * @param event
   * @param {object} route
   * @param {string} pathname
   * @return {boolean}
   */
  // eslint-disable-next-line complexity
  followLocalRoute(event, route, pathname) {
    const { state } = this;
    const authorized = !!state.user;
    if (route.local) {
      if (
        (route.authorized === false && authorized) ||
        (route.authorized === true && !authorized)
      ) {
        if (event) event.preventDefault();
        return true;
      }
      if (pathname) window.history.pushState(null, null, pathname);
      this.app.setState({ route });
      return true;
    }
    return false;
  }

  get csrfToken() {
    return cookies.get(axios.defaults.xsrfCookieName);
  }
}

export default new RoutingService();

export function getRouteView(name) {
  return routes[name].view;
}
