import React, {Component} from 'react';
import Map from './Map.react';
import RidgePlots from './RidgePlots.react';

const data = require('./data/data.json');

class App extends Component {
  _wrapper = {
    map: null,
    ridgePlots: null
  };
  state = {park: ''};

  _getWidth = (type) => {
    return this._wrapper[type]=== null ? 800 : this._wrapper[type].offsetWidth;
  }

  _onSelectPark(event) {
    const parkId = event.currentTarget.value;
    this.setState({
      park: parkId,
    });
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12 col-md-7 col-lg-8 first-md app-map">
            <div ref={div => {this._wrapper.map = div;}} />
            <Map
              data={data}
              selectedPark={this.state.park}
              getWidth={this._getWidth} />
          </div>
          <div className="col-xs-12 col-md-5 col-lg-4 first-xs app-title">
            <div>
              <h1> National Parks & Reactional Visitors </h1>
            </div>
            <select
              onChange={e => this._onSelectPark(e)}
              value={this.state.park}>
              {data.parks.map((park, i) => <option key={i}
                value={park.id}>{park.name} ({park.state}, {park.id})
                </option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
            <div ref={div => {this._wrapper.ridgePlots = div;}} />
            <RidgePlots
              data={data}
              selectedPark={this.state.park}
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
