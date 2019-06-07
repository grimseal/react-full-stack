import React from 'react';
import Link from './Link';
import './header.scss';

export default class Header extends React.Component {
  render() {
    const { props } = this;
    return props.user ? (
      <div className="header container clearfix">
        <div className="float-left">
          <Link href="/" content="Home" />
        </div>
        <div className="float-right">
          <span>Greetings</span>{' '}
          <Link href={props.user.link} content={props.user.name || props.user.username} />
          {'! '}
          <Link href="/logout" content="Logout" />
        </div>
      </div>
    ) : (
      <div className="header container clearfix">
        <div className="float-left">
          <Link href="/" content="Home" />
        </div>
        <div className="float-right">
          <Link href="/signin" content="SignIn" /> or <Link href="/signup" content="SignUp" />
        </div>
      </div>
    );
  }
}
