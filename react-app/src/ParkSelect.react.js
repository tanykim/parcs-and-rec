/******
/* React Component: React-Select park
******/

import React, { Component } from 'react';
import Select from 'react-select';
import { withStore } from './store';

let ParkSelect = withStore('selections')(class extends Component {
  render() {
    return (
      <Select
        name="form-field-name"
        clearable={true}
        multi={true}
        value={this.props.store.get('selections')}
        placeholder="Select a national park"
        onChange={(options) => this.props.onSetSelections(options)}
        options={this.props.parks.map(park => {
          return {value: park.id, label: park.name};
        })}/>
    );
  }
});

export default ParkSelect;
