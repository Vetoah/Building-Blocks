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
			zoomType: 'x',
			backgroundColor: 'transparent',
			zooming: {
				mouseWheel: true
			},
		},
		rangeSelector: {
			buttons: [{
				count: 1,
				type: 'minute',
				text: '1M',
				dataGrouping: {
					forced: true,
					units: [['minute', [1]]]
			}
			}, {
				count: 5,
				type: 'minute',
				text: '5M',
				dataGrouping: {
					forced: true,
					units: [['minute', [5]]]
			}
			}, {
				type: 'all',
				text: 'All'
			}],
			inputEnabled: false,
		},
		title: {
			text: 'BTC Price Data',
			style: {
				color: 'white'
			}
		},
		navigator: {
			enabled: true,

		},

		scrollbar: {
			enabled: true
		},

		xAxis: {
			gridLineWidth: 1,
			gridLineColor: '#292B2E',
			// min: 0, 
			// max: 1559779200000
			tickPixelInterval: 50,
			minTickPixelInterval: 50,
			labels: {
				step: 2,
				style: {
					color: 'white'
			}
		}

		},

		yAxis: [{
			labels: {
				align: "right",
				x: -3
			},
			title: {
				text: "OHLC"
			},
			height: '100%',
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
			offset: 50,
			backgroundColor:'green',
			top: '75%',
			
			height: '25%',
			gridLineWidth: 0,
			gridLineColor: 'transparent',

		}],


		legend: {
			enabled: false
		},
		toolTip: {
			enabled: false,
			split: true
		},
		plotOptions: {
			series: {
				// enableMouseTracking: false,
				pointPadding: 0,
				dataGrouping: {
					units: [
						[
							'minute',
							[1, 2, 5, 10, 15, 30]
						]
					]
				}
			},
			column: {
				colorByPoint: true,
				colors: ['#2F394B'],

				yAxis: [{
					gridLineWidth: 5,

				}],
				pointPadding: 0,

			},
		},
		series: [{
			type: 'candlestick',
			name: 'BTC Price Data',
			color: '#EB4D5C',
			lineColor: '#EB4D5C',
			upColor: '#53B987',
			upLineColor: '#53B987',
			yAxis: 0,
			data: [],
			dataGrouping: {
				units: [
					[
						'minute',
						[1, 2, 5, 10, 15, 30]
					]
				]
			},

		},
		{
			type: 'column',
			name: 'volume',
			yAxis: 1,
			borderColor: 'transparent',
			data: [],
			dataGrouping: {
				units: [
					[
						'minute',
						[1, 2, 5, 10, 15, 30]
					]
				]
			},

		}]
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

			if (data.type === 'connection_established') {
				getData()
					.then((response) => {
						console.log('bruh')
						const volume = response.map((array) => [array[0], array[array.length - 1]]);
						console.log(response)
						setOptions({
							series: [{
								...options.series[0],
								data: response
							}, {
								...options.series[1],
								data: volume,
							}]
						});


					})
					.catch((error) => {
						console.error(error);
					});
			} else if (data.type === 'new') {
				const values = data.message.map(item => parseFloat(item));
				const volumeColor = values[1] < values[4] ? '#53B987' : '#EB4D5C';
				console.log('color: ' + volumeColor)
				setOptions({
					series: [{
						...options.series,
						data: [...options.series[0].data, [...values]]
					}, {
						...options.series,
						data: [...options.series[1].data, [values[0], values[5]]],
						colors: [...options.series[1].colors, volumeColor]
					}]
				});

			} else if (data.type === 'update') {
				const values = data.message.map(item => parseFloat(item));
				const volumeColor = values[1] < values[4] ? '#53B987' : '#EB4D5C';
				console.log('color: ' + volumeColor)
				// console.log('update: '+ [...options.series[0].data.slice(0, -1), [...values]])

				setOptions({
					series: [{
						...options.series,
						data: [...options.series[0].data.slice(0, -1), [...values]]
					}, {
						...options.series,
						data: [...options.series[1].data.slice(0, -1), [values[0], values[5]]],
						colors: [...options.series[1].colors, volumeColor]
					}]
				});
			}

			console.log('init: ' + options.series[1].colors)
		}

	}, [ws, options.series])
	return (
		<>
				<HighchartsReact
					highcharts={Highcharts}
					options={options}
					constructorType={'stockChart'}
				/>
		</>


	);
}


function App() {
	const ws = new WebSocket("ws://localhost:8000/ws/socket-server/");

	return (
		<div style={{ position: 'relative', width: '75%', marginInline: 'auto', marginBlock: 'auto', height: 'auto', paddingBlock: '5%' }}>
			<CandleChart ws={ws} />
		</div>
	)
}

export default App;
