import './App.css';
import React, { Suspense, useEffect, useState } from 'react';
// import Chart from './Chart';
// import { TypeChooser } from "react-stockcharts/lib/helper";

import { getData } from "./utils"


import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

// class ChartComponent extends React.Component {

// 	componentDidMount() {
// 		getData().then(data => {
// 			if (this.state === null)
// 				this.setState({ data })
// 			else {
// 				if (this.state.data !== data) {
// 					this.setState({ data })
// 					console.log('new data')
// 					console.log(data)
// 				}
// 			}

// 		})
// 	}

// 	componentWillUnmount() {
// 		clearInterval(this.interval);
//   }
// 	render() {
// 		if (this.state == null) {
// 			return <div>Loading...</div>
// 		}
// 		return (
// 			<TypeChooser>
// 				{type => <Chart type={type} data={this.state.data} />}
// 			</TypeChooser>
// 		)
// 	}
// }

function CandleChart({ ws }) {

	const [data, setData] = useState(null);

	const [options, setOptions] = useState({
		chart: {
			type: 'candlestick',
			backgroundColor: 'transparent',
	
			zooming: {
				mouseWheel: true
			},
			style: {
				// position:'absolute',
			}
		},
		rangeSelector: {
			buttons: [{
					count: 1,
					type: 'minute',
					text: '1M'
			}, {
					count: 5,
					type: 'minute',
					text: '5M'
			}, {
					type: 'all',
					text: 'All'
			}],
			inputEnabled: true,
			selected: 0
	},
		title: {
			text: 'BTC Price Data',
			style: {
				color: 'white'
			}
		},
		navigator: {
			enabled: false,
			color:'purple',
		},

		scrollbar: {
			enabled: true
		},
		xAxis: {
			gridLineWidth: 1,
			gridLineColor: '#292B2E',
			tickPixelInterval: 50,
			minTickPixelInterval: 50
		},

		yAxis: {
			gridLineWidth: 1,
			gridLineColor: '#292B2E'
		},



		series: {
			name: 'AAPL Stock Price',
			color: '#EB4D5C',
			lineColor: '#EB4D5C',
			upColor: '#53B987',
			upLineColor: '#53B987',
			data: [],
			// maxPointWidth: 5,
			// pointWidth: 5,
			dataGrouping: {
				units: [
					[
						'minute',
						[5,10,15]
					], [
						'hour',
						[1]
					]
				]
			}
		}
	})

	useEffect(() => {
		ws.onmessage = function (e) {
			let data = JSON.parse(e.data)
			console.log('message: ', data.message)
			console.log('type: ', data.type)
			
			if (data.type === 'connection_established') {
				getData()
					.then((response) => {
						setOptions({
							series: [{
								...options.series,
								data: response
							}]
						});
					})
					.catch((error) => {
						console.error(error);
					});
			} else if (data.type === 'new') {
				const values = data.message.map(item => parseFloat(item));
				// console.log(values)
				setOptions({
					series: [{
						...options.series,
						data: [...options.series[0].data, [...values]]
					}]
				});

			} else if (data.type === 'update') {
				const values = data.message.map(item => parseFloat(item));
				// console.log(values)
				// console.log(typeof(options.series[0]?.data))
				setOptions({
					series: [{
						...options.series,
						data: [...options.series[0].data.slice(0,-1), [...values]]
					}]
				});
			}
			// console.log(options.series[0]?.data)
			
		}
		
	}, [ws, options.series])
	return (
		<div style={{}}>
			<HighchartsReact
				highcharts={Highcharts}
				options={options}
				constructorType={'stockChart'}
				style={{}}
			/>
		</div>

	);
}

require('highcharts/modules/stock')(Highcharts);
function App() {
	const ws = new WebSocket("ws://localhost:8000/ws/socket-server/");

	return (
		<div style={{ backgroundColor: '#11141B', height: '100vh', width: '100%', position:'fixed'}}>
			<div style={{ position: 'relative', width: '75%', marginInline: 'auto', marginBlock: 'auto' }}>
				<CandleChart ws={ws}/>
			</div>
		</div>
	);
}

export default App;
