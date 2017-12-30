import React from 'react';
import ReactDOM from 'react-dom';
import 'flexboxgrid/dist/flexboxgrid.min.css';
import 'react-select/dist/react-select.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
