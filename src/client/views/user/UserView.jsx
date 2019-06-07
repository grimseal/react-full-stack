import React from 'react';
import Link from 'client/components/Link';
import Holder from 'client/components/Holder';

export default class UserView extends React.Component {
  constructor(props) {
    super(props);
    const { user } = props;
    this.state = {
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      editLink: `${user.link}/edit`
    };
  }

  get isCurrentUser() {
    const { props } = this;
    return props.user._id === props.currentUser._id;
  }

  render() {
    const { state } = this;

    return (
      <div className="user-page container">
        <h1>User Page</h1>
        <h2>{state.name}</h2>
        <Holder src="320x240" />
        <dl className="row">
          <dt className="col-sm-3">Username</dt>
          <dd className="col-sm-9">{state.username}</dd>

          <dt className="col-sm-3">Name</dt>
          <dd className="col-sm-9">{state.name}</dd>

          <dt className="col-sm-3">Email</dt>
          <dd className="col-sm-9">{state.email}</dd>
        </dl>

        {this.isCurrentUser ? (
          <div className="row">
            {' '}
            <Link className="btn btn-primary" href={state.editLink} content="Edit profile" />
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}
