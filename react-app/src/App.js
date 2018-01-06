import React, {Component} from 'react';
import Select from 'react-select';

import Map from './Map.react';
import RidgePlots from './RidgePlots.react';

const data = require('./data/data.json');
const MULTI_MAX = 4;

class App extends Component {
  _wrapper = {
    map: null,
    ridgePlots: null
  };
  state = {selections: [], isMultiMax: false};

  _getWidth = (type) => {
    return this._wrapper[type]=== null ? 800 : this._wrapper[type].offsetWidth;
  }

  _onParkSelected = (option) => {
    this.setState({isMultiMax: option.length === MULTI_MAX + 1});
    // if selection already reached the max, do not add more
    if (option.length === MULTI_MAX + 1) {
      return;
    }
    this.setState({selections: option});
  }

  _selectPark = (id) => {
    const park = data.parks.filter(park => park.id === id)[0];
    const option = [{value: park.id, label: park.name}];
    this._onParkSelected(this.state.selections.concat(option));
  }

  _unselectPark = (id) => {
    const newOption = this.state.selections.filter(sel => sel.value !== id);
    this.setState({selections: newOption, isMultiMax: false});
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12 col-md-7 col-lg-8 first-md app-map">
            <div ref={div => {this._wrapper.map = div;}} />
            <Map
              data={data}
              selections={this.state.selections}
              onSelectPark={this._selectPark}
              onUnselectPark={this._unselectPark}
              getWidth={this._getWidth} />
          </div>
          <div className="col-xs-12 col-md-5 col-lg-4 first-xs app-title">
            <div>
              <h1> National Parks & Reactional Visitors </h1>
            </div>
            <Select
              name="form-field-name"
              clearable={true}
              multi={true}
              value={this.state.selections}
              placeholder="Select a national park"
              onChange={this._onParkSelected}
              options={data.parks.map(park => {
                return {value: park.id, label: park.name};
              })}
            />
            { this.state.selections.length > 1 && <div>Compare all</div> }
            { this.state.isMultiMax && <div>Copmare only up to 4</div>}
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
            <div ref={div => {this._wrapper.ridgePlots = div;}} />
            <RidgePlots
              data={data}
              selections={this.state.selections}
              onSelectPark={this._selectPark}
              onUnselectPark={this._unselectPark}
              getWidth={this._getWidth} />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            FOOTER
          </div>
        </div>
      </div>
    );
  }
}

export default App;
