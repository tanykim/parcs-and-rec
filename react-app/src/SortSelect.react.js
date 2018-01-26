/******
/* React Component: React-Select park
******/

import React, { Component } from 'react';
import Select from 'react-select';
import { withStore } from './store';

let SortSelect = withStore('sortOption')(class extends Component {
  _onOptionChange = (option) => {
    const optionVal = option.value;
    this.props.store.set('sortOption')(optionVal);
    this.props.onOptionChange(optionVal);
  }

  render() {
    return (
      <Select
        clearable={false}
        searchable={false}
        value={this.props.store.get('sortOption')}
        placeholder="Sort parks by"
        onChange={(option) => this._onOptionChange(option)}
        options = {[
          {label: 'Name: A to Z', value: 'name-asc'},
          {label: 'Name: Z to A', value: 'name-desc'},
          {label: 'Total visitors: large to small', value: 'total-desc'},
          {label: 'Total visitors: small to large', value: 'total-asc'},
          {label: 'Size: large to small', value: 'size-desc'},
          {label: 'Size: small to large', value: 'size-asc'},
          {label: 'Location: west to east', value: 'lon-asc'},
          {label: 'Location: east to west', value: 'lon-desc'},
          {label: 'Location: north to south', value: 'lat-desc'},
          {label: 'Location: south to north', value: 'lat-asc'},
        ]}
      />
    );
  }
});

export default SortSelect;
