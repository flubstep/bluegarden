import React, { Component } from 'react';

import RansacController from './components/RansacController';
import LidarScene from './scene/LidarScene';

import './App.css';

const TEST_JSON_URL = '/data/1815.small_uncompressed.json';

class App extends Component {

  constructor(props, context) {
    super(props, context);
    this.scene = new LidarScene();
    window.scene = this.scene;
    this.state = {
      pointsLoaded: false
    };
  }

  componentDidMount() {
    this.scene.initialize(this.refs.sceneContainer);
    this.loadPointsFromUrl(TEST_JSON_URL);
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth
    });
  }

  async loadPointsFromUrl(url) {
    console.time('network data from url');
    const response = await fetch(url);
    const data = await response.json();
    console.timeEnd('network data from url');
    console.time('add points to buffer');
    this.scene.addDataFromBuffer(data);
    console.timeEnd('add points to buffer');
    this.setState({ pointsLoaded: true });
  }

  render() {
    const height = this.state.height || window.innerHeight;
    const width = this.state.width || window.innerWidth;
    if (document.location.search.includes('demo')) {
      return (
        <div className="App">
          <div ref="sceneContainer" style={{ height, width, backgroundColor: "black" }} />
        </div>
      );
    }
    return (
      <div className="App">
        { this.state.pointsLoaded ? (
            <RansacController scene={this.scene} />
          ) : (
            <h1>Loading point cloud...</h1>
          )
        }
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
