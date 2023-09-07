
import CandleStickChartWithMACDIndicator from "./CandleStickChart";
import updatingDataWrapper from "./updatingDataWrapper";

const CandleStickChartWithUpdatingData = updatingDataWrapper(CandleStickChartWithMACDIndicator);

export default CandleStickChartWithUpdatingData;
