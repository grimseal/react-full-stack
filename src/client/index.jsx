import React from 'react';
import ReactDOM from 'react-dom';
import App from 'client/App';

const script = document.querySelector('body > script[data-props]');
const props = JSON.parse(atob(script.getAttribute('data-props')));

ReactDOM.hydrate(<App {...props} />, document.getElementById('root'));
