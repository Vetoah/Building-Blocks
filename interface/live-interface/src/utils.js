export async function getData() {
	return fetch("http://127.0.0.1:8000/api/klinetrades/get")
		.then(response => {
      return response.json()
    })
		.then(data => {
      return data.map(obj => Object.values(obj).map(value => parseFloat(value)))
    });

}


export async function getOrders() {
  const unfiltered_asks = []
  let lowest_ask = 100000
  const unfiltered_bids = []
  let highest_bid = 0
  let qty = 0

  const orders = await fetch("http://127.0.0.1:8000/api/orderbook/get")
    .then(response => response.json())
    .then(data => data.map((obj) => {
      
      if (Object.values(obj)[2] === 'asks') {
        unfiltered_asks.push([parseFloat(Object.values(obj)[0]), parseFloat(Object.values(obj)[1])])
        if (parseFloat(Object.values(obj)[0]) < lowest_ask)
          lowest_ask = parseFloat(Object.values(obj)[0])
        if (parseFloat(Object.values(obj)[1]) > qty)
          qty = parseFloat(Object.values(obj)[1])
      }
      else {
        unfiltered_bids.push([parseFloat(Object.values(obj)[0]), parseFloat(Object.values(obj)[1])])
        if (parseFloat(Object.values(obj)[0]) > highest_bid)
          highest_bid = parseFloat(Object.values(obj)[0])
        if (parseFloat(Object.values(obj)[1]) > qty)
          qty = parseFloat(Object.values(obj)[1])
      }
      return null
    }
    ));
    const asks = unfiltered_asks.filter(item => item[0] >= highest_bid)
    const bids = unfiltered_bids.filter(item => item[0] <= lowest_ask)
    return { asks, bids, qty }
}