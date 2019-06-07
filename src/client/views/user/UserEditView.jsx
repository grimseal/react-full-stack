import React from 'react';
import RoutingService from 'client/services/RoutingService';
import axios from 'axios';

const method = 'POST';

function makeUrl(username) {
  return `/user/${username}/edit`;
}

export default class UserEditView extends React.Component {
  constructor(props) {
    super(props);
    const { user } = props;
    this.state = {
      success: false,
      error: props.error || null,
      url: makeUrl(user.username),
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      csrfToken: props.csrfToken || RoutingService.csrfToken
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    // todo validate user input
    const { url, name, username, email } = this.state;
    axios({
      url,
      method,
      maxRedirects: 0,
      responseType: 'json',
      data: {
        name,
        username,
        email
      }
    })
      .then(response => {
        RoutingService.handleResponse(response);
        this.setState({ success: true, error: null, url: makeUrl(username) });
      })
      .catch(error => this.setState({ success: false, error: error.response.data.error }));
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
    const error = (state.error || {}).params || {};

    return (
      <div className="user-edit-page container">
        <div className="row">
          <div className="col-md-8 order-md-1">
            <h1>User Edit</h1>
            {state.success ? (
              <div className="alert alert-success" role="alert">
                User profile update successful
              </div>
            ) : (
              ''
            )}
            <form
              action={state.url}
              method={method}
              onSubmit={e => this.handleSubmit(e)}
              className="needs-validation"
              noValidate=""
            >
              <input type="hidden" name="_csrf" value={state.csrfToken} />
              <div className="mb-3">
                <label htmlFor="username">
                  <span>Username</span>
                  <input
                    type="text"
                    className={error.username ? 'form-control is-invalid' : 'form-control'}
                    id="username"
                    name="username"
                    value={state.username}
                    onChange={e => this.handleChange(e)}
                    required
                    autoComplete="off"
                  />
                  <div className="invalid-feedback">Valid username is required.</div>
                </label>
              </div>
              <div className="mb-3">
                <label htmlFor="name">
                  <span>
                    Name <span className="text-muted">(Optional)</span>
                  </span>
                  <input
                    type="text"
                    className={error.name ? 'form-control is-invalid' : 'form-control'}
                    id="name"
                    name="name"
                    value={state.name}
                    onChange={e => this.handleChange(e)}
                    autoComplete="off"
                  />
                  <div className="invalid-feedback">Valid name is required.</div>
                </label>
              </div>
              <div className="mb-3">
                <label htmlFor="email">
                  <span>
                    Email <span className="text-muted">(Optional)</span>
                  </span>
                  <input
                    type="email"
                    className={error.email ? 'form-control is-invalid' : 'form-control'}
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={state.email}
                    onChange={e => this.handleChange(e)}
                    autoComplete="off"
                  />
                  <div className="invalid-feedback">Valid email is required.</div>
                </label>
                <div className="invalid-feedback">
                  Please enter a valid email address for shipping updates.
                </div>
              </div>
              <div className="mb-4">
                <button className="btn btn-primary" type="submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
