import './App.css';
import React, { Suspense, useEffect, useState } from 'react';
import Chart from './Chart';
import { getData } from "./utils"

import { TypeChooser } from "react-stockcharts/lib/helper";

class ChartComponent extends React.Component {
	
	componentDidMount() {
		getData().then(data => {
			if (this.state === null)
				this.setState({ data })
			else {
				if (this.state.data !== data) {
					this.setState({ data })
					console.log('new data')
					console.log(data)
				}
			}

		})
	}

	componentWillUnmount() {
		clearInterval(this.interval);
  }
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

function App() {
	const ws = new WebSocket("ws://localhost:8000/ws/socket-server/");
	
	useEffect(() => {
		ws.onmessage = function(e) {
			let data = JSON.parse(e.data)
			console.log('Data: ', data)
			console.log('type: ', data.type)
		}
	})
	return (
		<>
			<ChartComponent />
		</>
	);
}

export default App;
