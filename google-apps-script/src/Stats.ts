namespace Stats {
  export const linearRegression = (data: Array<{ x: number; y: number }>) => {
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
