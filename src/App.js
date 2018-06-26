import React, { Component } from 'react';

import RansacController from './components/RansacController';
import LidarScene from './scene/LidarScene';

import './App.css';

const TEST_JSON_URL = '/data/1815.small_uncompressed.json';

class App extends Component {

  constructor(props, context) {
    super(props, context);
    this.scene = new LidarScene();
  }

  componentDidMount() {
    this.scene.initialize(this.refs.sceneContainer);
    this.loadPointsFromUrl(TEST_JSON_URL);
  }

  async loadPointsFromUrl(url) {
    console.time('network data from url');
    const response = await fetch(url);
    const data = await response.json();
    console.timeEnd('network data from url');
    console.time('add points to buffer');
    this.scene.addDataFromBuffer(data);
    console.timeEnd('add points to buffer');
  }

  render() {
    const height = window.innerHeight;
    const width = window.innerWidth;
    return (
      <div className="App">
        <RansacController scene={this.scene} />
        <div
          ref="sceneContainer"
          style={{
            height: height,
            width: width,
            backgroundColor: 'black'
          }}
        >
        </div>
      </div>
    );
  }
}

export default App;
