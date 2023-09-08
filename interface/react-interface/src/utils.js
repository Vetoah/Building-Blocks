

import { timeParse } from "d3-time-format";


function parseData(data) {
  const parseDate = timeParse("%Y-%m-%d %H:%M:%S");

  return data.map(d => {
    return {
      timestamp: parseDate(d.timestamp), 
      open: parseInt(d.opening), 
      high: parseInt(d.high), 
      low: parseInt(d.low), 
			close: parseInt(d.closing), 
      volume: parseFloat(d.volume) 
    };
  })
}


export function getData() {
	const json_fetch = fetch("http://127.0.0.1:8000/trades")
		.then(response => response.text())
		.then(data => parseData(JSON.parse(data)))
	return json_fetch;
}

