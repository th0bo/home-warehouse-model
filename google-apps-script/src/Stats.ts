namespace Stats {
  const dateRegExp = /(\d{2})\/(\d{2})\/(\d{4})/;

  type MatchedReceiptLine = ReceiptLine & { commonLabel: string };

  export const computeRegressions = (lines: MatchedReceiptLine[]) => {
    const labelToDataSet = new Map<string, Array<{ x: number; y: number }>>();
    const labels: string[] = [];

    for (const line of lines) {
      const { commonLabel: label, amount: dy, date: x } = quantify(line);

      const dataSet =
        labelToDataSet.get(label) ??
        (() => {
          labels.push(label);
          const newDataSet = [];
          labelToDataSet.set(label, newDataSet);
          return newDataSet;
        })();
      const y = dataSet.length === 0 ? dy : dataSet[dataSet.length - 1].y + dy;
      dataSet.push({ x, y });
    }

    return labels.map((label) => {
      const dataSet = labelToDataSet.get(label);
      if (dataSet === undefined || dataSet.length < 2) {
        return { label, diff: null, meanY: null };
      }
      /**
       * This value should give the value threshold of diff, when diff is near or higher
       * than this value a refill should be considered.
       */
      const meanY = dataSet.reduce((sum, { y }) => sum + y, 0) / dataSet.length;
      const { intercept, slope } = linearRegression(dataSet);
      const yForecast = intercept + slope * new Date().getTime();
      const diff = yForecast - dataSet[dataSet.length - 1].y;
      return { label, diff, meanY };
    });
  };

  const quantify = ({ commonLabel, amount, date }: MatchedReceiptLine) => {
    const dateMatcher = date.match(dateRegExp);
    if (dateMatcher === null) {
      throw new Error(`[${date}] could not be parsed as a date.`);
    }

    const day = Number(dateMatcher[1]);
    const monthIndex = Number(dateMatcher[2]) - 1;
    const year = Number(dateMatcher[3]);

    return {
      commonLabel,
      amount: parseFloat(amount.replace(/\s/g, "").replace(",", ".")),
      date: new Date(year, monthIndex, day).getTime(),
    };
  };

  const linearRegression = (data: Array<{ x: number; y: number }>) => {
    const n = data.length;

    // Calculate mean of x and y
    const meanX = data.reduce((sum, { x }) => sum + x, 0) / n;
    const meanY = data.reduce((sum, { y }) => sum + y, 0) / n;

    // Calculate slope (m) and y-intercept (b)
    const numerator = data.reduce(
      (sum, { x, y }) => sum + (x - meanX) * (y - meanY),
      0
    );
    const denominator = data.reduce(
      (sum, { x }) => sum + Math.pow(x - meanX, 2),
      0
    );

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    return { slope, intercept };
  };
}
