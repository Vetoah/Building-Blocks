
import React from 'react';
import { render } from 'react-dom';
import Chart from './Chart';
import { getData } from "./utils"

import { TypeChooser } from "react-stockcharts/lib/helper";

class ChartComponent extends React.Component {
  componentDidMount() {
    this.interval = setInterval(() => {
      getData().then(data => {
        this.setState({ data })
        console.log(data)
      })
    }, 1000)
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

render(
	<ChartComponent />,
	document.getElementById("root")
);
