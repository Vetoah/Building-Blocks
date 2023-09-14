import './App.css';
import React, { Suspense, useEffect, useState } from 'react';
import { config, a, animated, useSpring, useSprings } from '@react-spring/web'

import { getData, getOrders } from "./utils"


import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

require('highcharts/modules/stock')(Highcharts);
require('highcharts/modules/price-indicator')(Highcharts);

function DisplayBids({ marked, bids, latestPrice, max }) {
	const updatedAnim2 = useSpring(bids.length, (index) => ({
		from: {
			backgroundColor: marked[index] ? '#53B987' : 'transparent'
		},
		to: {
			backgroundColor: 'transparent'
		},

	}))

	const [updatedAnim] = useSprings(
		bids.length,
		(i) => ({
			from: {
				backgroundColor: marked[i] ? '#53B987' : 'transparent'
			},
			to: {
				backgroundColor: 'transparent'
			},
			config: config.slow
		}),
		[marked]
	);

	useEffect(() => {
	}, [bids, marked])
	return (
		<div style={{ height: '45%', overflow: 'hidden', position: 'relative' }}>

			{updatedAnim.map(({ backgroundColor }, i) => (
				<div style={{ height: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
					<div style={{ textAlign: 'left', color: '#53B987', width: '20%', }}>
						{bids[i][0]}
					</div>
					<animated.div style={{ textAlign: 'right', width: '35%', backgroundColor }}>
						{(bids[i][1] / latestPrice).toFixed(5)}
					</animated.div>
					<div style={{ textAlign: 'right', width: '35%', position: 'relative' }}>
						<div style={{ position: 'absolute', width: `${bids[i][1] / max * 100}%`, height: '100%', backgroundColor: '#53B98725' }} />
						{bids[i][1]}
					</div>
				</div>
			))}

			{/* {bids.map((innerArray) => (
					<div style={{ height: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
						<div style={{ textAlign: 'left',color:'#53B987', width:'20%', backgroundColor:'grey' }}>
							{innerArray[0]}
						</div>
						<a.div style={{ textAlign: 'right', width:'35%', backgroundColor:'grey' }}>
							{(innerArray[1] / latestPrice).toFixed(5)}
						</a.div>
						<div style={{ textAlign: 'right', width:'35%', backgroundColor:'grey' }}>
							{innerArray[1]}
						</div>
					</div>
				))} */}
		</div>
	)
}
// lineColor: '#EB4D5C',
// 			upColor: '#53B987',
function DisplayAsks({ marked, asks, latestPrice, max }) {
	const [updatedAnim] = useSprings(
		asks.length,
		(i) => ({

			config: config.slow
		}),
	);

	useEffect(() => {
	}, [asks, marked, latestPrice])
	return (
		<>
			<div style={{ position: 'absolute', top: '-25px', width: '95%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
				<span style={{ textAlign: 'center', width: '20%' }}>
					Price
				</span>
				<span style={{ textAlign: 'center', width: '35%' }}>
					Amount
				</span>
				<span style={{ textAlign: 'center', width: '35%' }}>
					Value (USD)
				</span>
			</div>

			<div style={{ height: '45%', width: '95%', position: 'relative', overflow: 'hidden', }}>

				{updatedAnim.map(({ backgroundColor }, i) => (
					<div style={{ height: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
						<div style={{ textAlign: 'left', color: '#EB4D5C', width: '20%', }}>
							{asks[i][0]}
						</div>
						<animated.div style={{ textAlign: 'right', width: '35%', backgroundColor }}>
							{(asks[i][1] / latestPrice).toFixed(5)}
						</animated.div>
						<div style={{ textAlign: 'right', width: '35%', position: 'relative' }}>
							<div style={{ position: 'absolute', width: `${asks[i][1] / max * 100}%`, height: '100%', backgroundColor: '#EB4D5C25' }} />
							{asks[i][1]}
						</div>
					</div>

				))}
				{/* {asks.map((innerArray) => (
					<div style={{ height: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
						<div style={{ textAlign: 'left', color:'#EB4D5C', width:'20%', backgroundColor:'grey' }}>
							{innerArray[0]}
						</div>
						<div style={{ textAlign: 'right', width:'35%', backgroundColor:'grey' }}>
							{(innerArray[1] / latestPrice).toFixed(5)}
						</div>
						<div style={{ textAlign: 'right', width:'35%', backgroundColor:'grey' }}>
							{innerArray[1]}
						</div>
					</div>
				))} */}
			</div>

		</>

	)
}

function OrderBook({ data }) {
	const [max, setMax] = useState(0)
	const [asks, setAsks] = useState([])
	const [markedAsks, setMarkedAsks] = useState([])

	const [bids, setBids] = useState([])
	const [markedBids, setMarkedBids] = useState([])

	const [latestTradePrice, setPrice] = useState(25810.15)

	useEffect(() => {
		setInterval(() => {
			getOrders()
				.then((response) => {
					setAsks(response.asks.reverse())
					setBids(response.bids)
					setMax(response.qty)
				})
				.catch((error) => {
					console.error(error);
				});
		}, 5000);

		if (data?.type === 'connection_established' || data?.type === 'new' || data?.type === 'update') {
			getOrders()
				.then((response) => {
					setAsks(response.asks.reverse())
					setBids(response.bids)
					setMax(response.qty)
				})
				.catch((error) => {
					console.error(error);
				});
		}

	}, [data])
	return (
		<div style={{ borderWidth: '1px', color: '#C9C9C9', height: '100%', width: '250px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingInline: '10px', }}>
			<DisplayAsks marked={markedAsks} asks={asks} latestPrice={latestTradePrice} max={max} />
			<div style={{ height: '50px', display: 'flex', alignItems: 'center', borderTop: '1px solid #C9C9C950', borderBottom: '1px solid #C9C9C950', marginRight: '10px' }}>
				{latestTradePrice}

			</div>
			<DisplayBids marked={markedAsks} bids={bids} latestPrice={latestTradePrice} max={max} />
		</div>
	)
}

function CandleChart({ data }) {
	const [options, setOptions] = useState({
		chart: {
			margin: [0, 0, 30, 0],
			spacingRight: 50,
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
			enabled: false,

		},
		tooltip: {
			enabled: false
		},

		scrollbar: {
			enabled: false
		},




		xAxis: {
			width: '88%',
			crosshair: {
				snap: false,
				color: '#575B61'
			},
			gridLineWidth: 1,
			gridLineColor: '#242628',
			// startOnTick: true,
			// endOnTick: true,
			tickPixelInterval: 150,
			minTickPixelInterval: 150,
			labels: {
				step: 2,
				style: {
					color: 'white'
				}
			}

		},

		yAxis: [{
			tickPixelInterval: 75,
			minTickPixelInterval: 75,
			crosshair: {
				snap: false,
				color: '#575B61',
				label: {
					enabled: true,
					format: '{value:.2f}',
					style: {

					}
				}
			},
			labels: {
				overflow: 'allow',
				align: 'right',
				x: -20,
				style: {
					color: '#C9C9C9'
				}
			},
			height: '100%',
			gridLineWidth: 1,
			gridLineColor: '#242628',
			resize: {
				enabled: true
			}
		}, {

			top: '75%',
			height: '25%',
			gridLineColor: 'transparent',
			labels: {
				enabled: false,
			}

		}],


		legend: {
			enabled: false
		},

		plotOptions: {
			series: {
				borderRadius: {
					radius: 0
				},
				groupPadding: 0.1,
				pointPadding: 0.05,
				dataLabels: {
					crop: false,
					overflow: 'allow'
				},
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

				dataGrouping: {
					units: [
						[
							'minute',
							[5]
						]
					]
				}
			},
			column: {
				labels: {
					enabled: false
				},
				colorByPoint: true,
				colors: ['#2F394B'],
				yAxis: [{
					gridLineWidth: 5,
					reversed: true

				}],

			},
		},
		series: [{
			type: 'candlestick',
			name: 'BTC Price Data',
			color: '#EB4D5C',
			lineColor: '#EB4D5C',
			upColor: '#53B987',
			upLineColor: '#53B987',
			lastVisiblePrice: {
				enabled: true,
				label: {
					enabled: true,

					style: {
						color: '#C9C9C9',
					}
				}
			},
			yAxis: 0,
			data: [],
			dataGrouping: {
				units: [
					[
						'minute',
						[5]
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
						[5]
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
					// console.log(response)
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



function App() {
	const [msg, setMessage] = useState(null)
	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8000/ws/socket-server/");

		ws.onmessage = function (e) {
			let data = JSON.parse(e.data)
			setMessage(data)

		}
	}, [])

	return (
		<div style={{ height: '75vh', width: '100%', display: 'flex', justifyContent: 'center', marginBlock: '12.5vh' }}>
			<OrderBook data={msg} />
			<CandleChart data={msg} />
		</div>
	)
}

export default App;
