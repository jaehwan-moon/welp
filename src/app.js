import React from 'react';
import ReactDOM from 'react-dom';

import './app.css';
import 'fontawesome/css/font-awesome.css';

import App from 'containers/App/App'

const mountNode = document.querySelector('#root');
ReactDOM.render(<App />, mountNode);