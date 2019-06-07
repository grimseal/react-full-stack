import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import Header from 'client/components/Header';
import RoutingService, { getRouteView } from 'client/services/RoutingService';
import './bootstrap/scss/bootstrap.scss';

class App extends Component {
  /** @type {boolean} */
  uiLock = false;

  constructor(props) {
    super(props);
    this.uiLock = false;
    this.state = {
      data: props.data,
      user: props.user,
      view: getRouteView(props.route)
    };
  }

  componentDidMount() {
    RoutingService.init(this);
  }

  componentDidUpdate() {
    RoutingService.init(this);
  }

  get view() {
    const { state } = this;
    const { view } = state;
    const props = state.data
      ? { ...state.data, currentUser: this.user }
      : { currentUser: this.user };
    return React.createElement(view, props);
  }

  get user() {
    const { state } = this;
    return state.user || null;
  }

  render() {
    return (
      <div>
        <Header user={this.user} />
        {this.view}
      </div>
    );
  }
}

export default (process.env.NODE_ENV === 'development' ? hot(App) : App);

/**
 * Interface for classes that represent a color.
 *
 * @interface Socket
 * @extends {EventEmitter}
 */
