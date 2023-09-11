import './App.css';
import React, { Suspense, useEffect, useState } from 'react';
// import Chart from './Chart';
// import { TypeChooser } from "react-stockcharts/lib/helper";

import { getData } from "./utils"


import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
require('highcharts/modules/stock')(Highcharts);




function CandleChart({ ws }) {
	const [options, setOptions] = useState({
		chart: {
			backgroundColor: 'transparent',
			zooming: {
				mouseWheel: true
			},
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
			color: 'purple',
		},

		scrollbar: {
			enabled: true
		},
		xAxis: {
			gridLineWidth: 1,
			gridLineColor: '#292B2E',
			tickPixelInterval: 50,
			minTickPixelInterval: 50,

		},

		yAxis: [{
			labels: {
				align: "right",
				x: -3
			},
			title: {
				text: "OHLC"
			},
			height: "60%",
			gridLineWidth: 1,
			gridLineColor: '#292B2E',
			resize: {
				enabled: true
			}
		}, {
			labels: {
				align: "right",
				x: -3
			},
			title: {
				text: "Volume"
			},
			top: "65%",
			height: "35%",
			offset: 0,
			lineWidth: 2
		}],


		legend: {
			enabled: false
		},
		series: [{
			type: 'candlestick',
			name: 'BTC Price Data',
			color: '#EB4D5C',
			lineColor: '#EB4D5C',
			upColor: '#53B987',
			upLineColor: '#53B987',
			data: [],
			dataGrouping: {
				units: [
					[
						'minute',
						[1, 2, 5, 10, 15, 30]
					]
				]
			}
		},
		{
			type: 'column',
			name: 'volume',
			yAxis: 1,
			borderColor: '#1B2D30',
			data: [],
			dataGrouping: {
				units: [
					[
						'minute',
						[1, 2, 5, 10, 15, 30]
					]
				]
			}
		},
		]
	})





	useEffect(() => {
		// getData()
		// 	.then((response) => {
		// 		const volume = response.map((array) => [array[0], array[array.length - 1] * 2]);
		// 		setOptions({
		// 			series: [{
		// 				...options.series[0],
		// 				data: response
		// 			}, {
		// 				...options.series[1],
		// 				data: volume,
		// 			}]
		// 		});
		// 	})

		// 	.catch((error) => {
		// 		console.error(error);
		// 	});

		ws.onmessage = function (e) {
			let data = JSON.parse(e.data)
			// console.log('message: ', data.message)
			// console.log('type: ', data.type)



			if (data.type === 'connection_established') {
				getData()
					.then((response) => {
						const volume = response.map((array) => [array[0], array[array.length - 1]]);
						console.log(response)
						console.log(volume)
						setOptions({
							series: [{
								...options.series[0],
								data: response
							}, {
								...options.series[1],
								data: volume
							}]
						});
						
					})
					.catch((error) => {
						console.error(error);
					});
			} else if (data.type === 'new') {
				const values = data.message.map(item => parseFloat(item));
				setOptions({
					series: [{
						...options.series[0],
						data: [...options.series[0].data, [...values]]
					}, {
						...options.series[1],
						data: [...options.series[1].data, [values[0], values[5]]]
					}]
				});

			} else if (data.type === 'update') {
				const values = data.message.map(item => parseFloat(item));
				console.log(options.series[0])

				setOptions({
					series: [{
						...options.series[0],
						data: [...options.series[0].data.slice(0, -1), [...values]]
					}, {
						...options.series[1],
						data: [...options.series[1].data.slice(0, -1), [values[0], values[5]]]
					}]
				});
			}
		}

	}, [ws, options.series])
	return (
		<>
			<div style={{}}>
				<HighchartsReact
					highcharts={Highcharts}
					options={options}
					constructorType={'stockChart'}
				/>
			</div>

		</>


	);
}


function App() {
	const ws = new WebSocket("ws://localhost:8000/ws/socket-server/");

	return (
		<div style={{ backgroundColor: '#11141B', height: '100vh', width: '100%', position: 'fixed' }}>
			<div style={{ position: 'relative', width: '75%', marginInline: 'auto', marginBlock: 'auto' }}>
				<CandleChart ws={ws} />
			</div>
		</div>
	);
}

export default App;
