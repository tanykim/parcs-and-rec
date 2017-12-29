import React, { Component } from 'react';
import RidgePlots from './RidgePlots.react';
import Park from './Park.react';
// import './App.css';

const data = require('./data/data.json');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {park: '', visitor: null};
  }

  _onSelectPark(event) {
    const parkId = event.currentTarget.value;
    const weather = data.weather[parkId];
    this.setState({
      park: parkId,
      temp: weather.map(d => d.data.temperature).map(d => d.mean),
      prec: weather.map(d => d.data.precipitation).map(d => d.precipitation[1]),
      snow: weather.map(d => d.data.precipitation).map(d => d.snow_depth[1]),
      // temp: weather.map(d => d.data.temperature).map(d => [d.max[1], d.mean[1], d.min[1]]),
      // prec: weather.map(d => d.data.precipitation).map(d => [d.precipitation[1], d.snow_depth[1]]),
      visitor: data.parks.filter(park => park.id === parkId)[0].by_month,
    });
  }

  render() {
    return (
      <div className="App">
        <select onChange={e => this._onSelectPark(e)} value={this.state.park}>
          {data.parks.map((park, i) => <option key={i} value={park.id}>{park.name} ({park.state}, {park.id})</option>)}
        </select>
        <Park {...this.state} />
        <RidgePlots data={data} selectedPark={this.state.park} />
      </div>
    );
  }
}

export default App;