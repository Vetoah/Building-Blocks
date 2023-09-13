import './App.css';
import React, { Suspense, useEffect, useState } from 'react';
// import Chart from './Chart';
// import { TypeChooser } from "react-stockcharts/lib/helper";

import { getData, getOrders } from "./utils"


import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
require('highcharts/modules/stock')(Highcharts);




function CandleChart({ data }) {
	const [options, setOptions] = useState({
		chart: {
			backgroundColor: 'transparent',
			style: {
			},
			zooming: {
				mouseWheel: true
			},
		},
		rangeSelector: {
			enabled: false
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
		tooltip: {
			enabled: false
		},

		scrollbar: {
			enabled: true
		},




		xAxis: {
			crosshair:{
				snap: false,
				color: '#575B61'
			},
			gridLineWidth: 1,
			gridLineColor: '#292B2E',
			startOnTick: true,
      endOnTick: true,
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
			crosshair:{
				snap: false,
				color: '#575B61',
				label: {
					enabled: true,
					format: '{value:.2f}',
					style: {

					}
			}
			},
			
			height: '100%',
			gridLineWidth: 1,
			gridLineColor: '#292B2E',
			resize: {
				enabled: true
			}
		}, {
			
			top: '75%',
			height: '25%',
			gridLineColor: 'transparent',

		}],

		
		legend: {
			enabled: false
		},

		plotOptions: {
			series: {
				allowPointSelect: false,
				states: {
					hover: {
						enabled: false
					},
					inactive: {
						enabled: false
					},
					select: {
						enabled: false
					}
				},

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
					reversed: true

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


			if (data?.type === 'connection_established') {
				getData()
					.then((response) => {
						console.log(response)
						const volume = response.map((array) => [array[0], array[array.length - 1]]);
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
			} else if (data?.type === 'new') {
				const values = data.message.map(item => parseFloat(item));
				setOptions({
					series: [{
						...options.series,
						data: [...options.series[0].data, [...values]]
					}, {
						...options.series,
						data: [...options.series[1].data, [values[0], values[5]]],
					}]
				});

			} else if (data?.type === 'update') {
				const values = data.message.map(item => parseFloat(item));

				setOptions({
					series: [{
						...options.series,
						data: [...options.series[0].data.slice(0, -1), [...values]]
					}, {
						...options.series,
						data: [...options.series[1].data.slice(0, -1), [values[0], values[5]]],
					}]
				});
			}


	}, [data])
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

function DepthChart({ data }) {
	const [options, setOptions] = useState({
		chart: {
			backgroundColor: 'transparent',
			type:'area',
			inverted: true,
			title: null,
			zooming: {
				mouseWheel: false
			},
		},
		title: {
			text: null,
		},
		rangeSelector: {
			enabled: false
		},
		
		navigator: {
			enabled: false,

		},
		tooltip: {
			enabled: false
		},

		scrollbar: {
			enabled: false
		},




		xAxis: {
			reversed:false,
			crosshair:{
				snap: false,
				color: '#575B61',
				label: {
					enabled: true,
					format: '{value:.2f}',
			}
			},
			tickPixelInterval: 50,
			minTickPixelInterval: 50,
			minPadding: 0,
			maxPadding: 0,
			
			gridLineWidth: 1,
			gridLineColor: '#292B2E',

			labels: {
				
				align: 'right',
				x: -8,
				style: {
					color: 'white'
				}
			}

		},

		yAxis: [{
			
			lineWidth: 1,
			gridLineWidth: 0,
			tickWidth: 1,
			tickLength: 5,
			tickPosition: 'inside',
			title: {
				enabled: false,
			}
		}, {
		
			opposite: true,
			
			linkedTo: 0,
			linkedWidth: 1,
			gridLineWidth: 0,
			gridLineColor: '#292B2E',

			tickWidth: 1,
			tickLength: 5,
			tickPosition:'inside',
			title: {
				enabled: false,
			},
			labels: {
				enabled: false
		}
		}],

		
		legend: {
			enabled: false
		},

		plotOptions: {
			
			area: {
				allowPointSelect: false,
				states: {
					hover: {
						enabled: false
					},
					inactive: {
						enabled: false
					},
					select: {
						enabled: false
					}
				},
				lineWidth:1,
				fillOpacity: 0.2,
				step: 'center'
			}
		},
		series: [{

			name: 'asks',
			color: '#EB4D5C',
			data: [],

		},
		{
			name: 'bids',
			data: [],
			color: '#53B987'
		}]
	})





	useEffect(() => {

			if (data?.type === 'connection_established') {
				console.log('true')
				getOrders()
					.then((response) => {
		
						setOptions({
							series: [{
								...options.series[0],
								data: response.asks
							}, {
								...options.series[1],
								data: response.bids
							}]
						});


					})
					.catch((error) => {
						console.error(error);
					});
			} else if (data?.type === 'new') {
				const values = data.message.map(item => parseFloat(item));
				setOptions({
					series: [{
						...options.series,
						data: [...options.series[0].data, [...values]]
					}, {
						...options.series,
						data: [...options.series[1].data, [values[0], values[5]]],
					}]
				});

			} else if (data?.type === 'update') {
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
					}]
				});
			}


	}, [data])
	return (
		<div style={{width:'15%'}}>
			<HighchartsReact
				highcharts={Highcharts}
				options={options}
				constructorType={'chart'}
			/>
		</div>


	);
}


function App() {
	const [msg, setMessage] = useState(null)
	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8000/ws/socket-server/");

		ws.onmessage = function (e) {
			let data = JSON.parse(e.data)
			setMessage(data)
			console.log('rerender')
			
		}
	}, [])

	return (
		<div style={{ position: 'relative', marginInline: 'auto', marginBlock: 'auto', height: 'auto', paddingBlock: '5%', display:'flex', justifyContent:'center' }}>
			<DepthChart data={msg}/>
			<CandleChart data={msg}/>
		</div>
	)
}

export default App;
