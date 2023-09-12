

import { timeParse } from "d3-time-format";


function parseData(data) {
  // const parseDate = timeParse("%Y-%m-%d %H:%M:%S");

  return data.map(d => {
    return {
      date: parseInt(d.timestamp), 
      open: parseInt(d.opening), 
      high: parseInt(d.high), 
      low: parseInt(d.low), 
			close: parseInt(d.closing), 
      volume: parseFloat(d.volume) 
    };
  })
}


export function getData() {
	return fetch("http://127.0.0.1:8000/api/klinetrades/get")
		.then(response => {
      return response.json()
    })
		.then(data => {
     console.log(data)
    
      return data.map(obj => Object.values(obj).map(value => parseFloat(value)));
      
    })
	// return json_fetch;
}


export function getData2() {
	// const json_fetch = fetch("http://127.0.0.1:8000/trades")
	return fetch("https://demo-live-data.highcharts.com/aapl-ohlc.json")
		.then(response => {
      return response.json()
    })
		.then(data => {
      return data;
    })
}



