import './App.css';
import './index.css';
import React, { useEffect, useState } from 'react';
import { getData, getOrders } from "./utils"
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

require('highcharts/modules/stock')(Highcharts);
require('highcharts/modules/price-indicator')(Highcharts);

function DisplayBids({ bids, latestPrice, max }) {
	useEffect(() => {
	}, [bids, latestPrice, max])
	return (
		<div style={{ height: '45%', width: '95%', position: 'relative' }}>
			{bids.map((order) => (
				<div style={{ height: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
					<div className='robo' style={{ textAlign: 'left', color: '#53B987', width: '20%', }}>
						{(order[0]).toFixed(1)}
					</div>
					<div className='robo' style={{ textAlign: 'right', width: '35%' }}>
						{(order[1] / latestPrice).toFixed(5)}
					</div>
					<div className='robo' style={{ textAlign: 'right', width: '35%', position: 'relative' }}>
						<div style={{ position: 'absolute', width: `${order[1] / max * 100}%`, height: '100%', backgroundColor: '#53B98725', left:'0px' }} />
						{order[1].toLocaleString()}
					</div>
				</div>
			))}
		</div>
	)
}

function DisplayAsks({ asks, latestPrice, max }) {
	useEffect(() => {
	}, [asks, max, latestPrice])
	return (
		<>
			<div className='robo medium' style={{ position: 'absolute', top: '-25px', width: '95%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' ,}}>
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

			<div style={{ height: '45%', width: '95%', position: 'relative', }}>

				{asks.map((order) => (
					<div style={{ height: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
						<div className='robo' style={{ textAlign: 'left', color: '#EB4D5C', width: '20%', }}>
							{(order[0]).toFixed(1)}
						</div>
						<div className='robo' style={{ textAlign: 'right', width: '35%' }}>
							{(order[1] / latestPrice).toFixed(5)}
						</div>
						<div className='robo' style={{ textAlign: 'right', width: '35%', position: 'relative' }}>
							<div style={{ position: 'absolute', width: `${order[1] / max * 100}%`, height: '100%', backgroundColor: '#EB4D5C25', left:'0px' }} />
							{order[1].toLocaleString()}
						</div>
					</div>

				))}
			</div>
		</>
	)
}

function OrderBook({ data, currPrice }) {
	const [connected, setConnected] = useState(0)
	const [max, setMax] = useState(0)
	const [asks, setAsks] = useState([])
	const [bids, setBids] = useState([])
	const [latestTradePrice, setPrice] = useState(0)

	const handleOrders = () => {
		getOrders()
			.then((response) => {
				setAsks(response.asks.reverse().slice(-10))
				setBids(response.bids.slice(0, 10))
				setMax(response.qty)
			})
			.catch((error) => {
				console.error(error);
			});
	}

	useEffect(() => {
		if (data?.type === 'connection_established') {
			setConnected(true)
			setPrice(currPrice)
			handleOrders()
		} else if (data?.type === 'new' || data?.type === 'update') {
			const values = data.message.map(item => parseFloat(item));
			setPrice(values[4])
		}
		if (connected) {
			const intervalId = setInterval(handleOrders, 10000);
			return () => {
				clearInterval(intervalId)
			}
		}
	}, [data, connected, currPrice])
	return (
		<div style={{ borderWidth: '1px', color: '#C9C9C9', height: '100%', width: '300px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingInline: '0px', }}>
			<DisplayAsks asks={asks} latestPrice={latestTradePrice} max={max} />
			<div className='robo' style={{ height: '50px', justifyContent: 'left', alignItems: 'center', borderTop: '1px solid #C9C9C950', borderBottom: '1px solid #C9C9C950', marginRight: '10px' }}>
				Current price: <span className='medium' style={{textIndent:'1rem'}}> {(latestTradePrice).toLocaleString()} </span>
			</div>
			<DisplayBids bids={bids} latestPrice={latestTradePrice} max={max} />
		</div>
	)
}

function CandleChart({ data, init }) {
	const [options, setOptions] = useState({
		chart: {
			margin: [0, 0, 30, 0],
			spacingRight: 0,
			backgroundColor: 'transparent',
			zooming: {
				mouseWheel: true
			},
		},
		title: {
			text: 'BTC/USD',
			style:{
				color:'#C9C9C9',
			},
			align: 'left',
			x: 0,
			y: 10
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
			width: '88%',
			crosshair: {
				snap: false,
				color: '#575B61'
			},
			gridLineWidth: 1,
			gridLineColor: '#242628',
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
					backgroundColor:'#E8E8E8',
					style: {
						color: 'black',
					}
				}
			},
			yAxis: 0,
			data: [],
			dataGrouping: {
				units: [
					[
						'minute',
						[5,10,15]
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
						[5,10,15]
					]
				]
			},

		}]
	})

	useEffect(() => {
		if (data?.type === 'connection_established') {
			getData()
				.then((response) => {
					const current_price = response[response.length - 1][4]
					init(current_price)
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
		<HighchartsReact
			highcharts={Highcharts}
			options={options}
			constructorType={'stockChart'}
		/>
	);
}

function App() {
	const [msg, setMessage] = useState(null)
	const [initPrice, setInitPrice] = useState(0)

	const handleInitPrice = (price) => {
		console.log('handleInitPrice: ' + price)
		if (!initPrice)
			setInitPrice(price)
	}
	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8000/ws/socket-server/");
		ws.onmessage = function (e) {
			let data = JSON.parse(e.data)
			setMessage(data)
		}
	}, [])

	return (
		<>
			<div style={{ height: '75vh', width: '100%', display: 'flex', justifyContent: 'center', marginBlock: '12.5vh' }}>
				<OrderBook data={msg} currPrice={initPrice} />
				<CandleChart data={msg} init={handleInitPrice} />
			</div>
		</>
	)
}

export default App;
