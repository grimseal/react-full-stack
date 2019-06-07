import React from 'react';
import axios from 'axios';
import RoutingService from 'client/services/RoutingService';
import './auth.scss';
import logo from './logo.svg';

const formAction = '/signin';
const formMethod = 'post';

export default class SignInView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: props.error || null,
      username: props.username || '',
      password: props.password || '',
      remember: !!props.remember || false,
      csrfToken: props.csrfToken || RoutingService.csrfToken
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    // todo validate user input
    const { username, password, remember } = this.state;
    axios({
      url: formAction,
      method: formMethod,
      maxRedirects: 0,
      responseType: 'json',
      data: {
        username,
        password,
        remember
      }
    })
      .then(response => RoutingService.handleResponse(response))
      .catch(error => {
        console.log(error);
        this.setState({ error: error.response.data.error });
      });
  }

  handleChange(event) {
    const changes = {};
    if (event.target.type === 'checkbox') {
      changes[event.target.name] = !event.target.checked;
    } else {
      changes[event.target.name] = event.target.value;
    }
    this.setState({ ...changes });
  }

  render() {
    const { state } = this;

    const error = !state.error ? null : (
      <div className="alert alert-danger" role="alert">
        {state.error}
      </div>
    );

    return (
      <div className="auth-page text-center">
        <form action={formAction} method={formMethod} onSubmit={e => this.handleSubmit(e)}>
          <input type="hidden" name="_csrf" value={state.csrfToken} />
          <img className="mb-4" src={logo} alt="" width="72" height="72" />
          <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
          <label htmlFor="username">
            <span className="sr-only">Username</span>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Username"
              value={state.username}
              onChange={e => this.handleChange(e)}
              required
            />
          </label>
          <label htmlFor="password">
            <span className="sr-only">Password</span>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Password"
              value={state.password}
              onChange={e => this.handleChange(e)}
              required
            />
          </label>
          <div className="checkbox mb-3">
            <label htmlFor="remember">
              <input
                type="checkbox"
                value="remember"
                id="remember"
                name="remember"
                defaultChecked={state.remember}
                onChange={e => this.handleChange(e)}
              />
              <span> Remember me</span>
            </label>
          </div>
          <button className="btn btn-lg btn-primary btn-block" type="submit">
            Sign in
          </button>
          <br />
          {error}
        </form>
      </div>
    );
  }
}
