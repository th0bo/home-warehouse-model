namespace Stats {
  const dateRegExp = /(\d{2})\/(\d{2})\/(\d{4})/;

  type MatchedReceiptLine = ReceiptLine & { commonLabel: string };

  export const computeRegressions = (lines: MatchedReceiptLine[]) => {
    const labelToDataSet = new Map<string, Array<{ x: number; y: number }>>();
    const labels: string[] = [];

    for (const line of lines) {
      const { commonLabel: label, amount: dy, date: x } = line;

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
        return { label, diff: null, meanDy: null };
      }
      /**
       * This value should give the value threshold of diff, when diff is near or higher
       * than this value a refill should be considered.
       */
      const meanDy = dataSet[dataSet.length - 1].y / dataSet.length;
      const { intercept, slope } = linearRegression(dataSet);

      const nDaysFrom1900ToNow = (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 70);
        return d.getTime() / (1000 * 60 * 60 * 24)
      })()

      const yForecast = intercept + slope * nDaysFrom1900ToNow;
      const diff = yForecast - dataSet[dataSet.length - 1].y;
      return { label, diff, meanDy };
    });
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
