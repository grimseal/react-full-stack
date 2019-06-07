import React from 'react';
import RoutingService from 'client/services/RoutingService';

export default function Link(props) {
  const { className, href, content } = props;
  return (
    <a className={className} href={href} onClick={e => RoutingService.handleLinkClick(e)}>
      {content}
    </a>
  );
}
