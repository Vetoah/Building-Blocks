// import React from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App";
// import reportWebVitals from "./reportWebVitals";

// const rootElement = document.getElementById("root");
// const root = createRoot(rootElement);
// root.render(
// 	<App />
// );

// reportWebVitals();


import React from 'react';
import { render } from 'react-dom';
import Chart from './Chart';
import { getData } from "./utils"

import { TypeChooser } from "react-stockcharts/lib/helper";

class ChartComponent extends React.Component {
	constructor(props) {
    super(props);
    this.ws = new WebSocket("ws://localhost:8000/ws/socket-server/");
  }

	componentDidMount() {
		this.ws.onmessage = this.handleWebSocketMessage;
		getData().then(data => {
			this.setState({ data })
			console.log('hmmm')
		})
	}
	componentWillUnmount() {
    this.ws.close();
  }

	handleWebSocketMessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'ping') {
				console.log('pang')
				getData().then(data => {
					this.setState({ data })
					// console.log(data)
				})
			}
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  };

	render() {
		if (this.state == null) {
			return <div>Loading...</div>
		}
		return (
			<TypeChooser>
				{type => <Chart type={type} data={this.state.data} />}
			</TypeChooser>
		)
	}
}

render(
	<ChartComponent />,
	document.getElementById("root")
);

