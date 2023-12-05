import * as fs from "fs";
import * as tf from "@tensorflow/tfjs";

const inputSpan = 15;

const data = fs
  .readFileSync("data.tsv")
  .toString()
  .split("\n")
  .map((line) => line.split("\t"));

const dateToLine = new Map<string, string[][]>();
for (const [item, quantity, vat, unitPrice, amount, date] of data) {
  (
    dateToLine.get(date) ??
    (() => {
      const lines = [];
      dateToLine.set(date, lines);
      return lines;
    })()
  ).push([item, quantity, vat, unitPrice, amount, date]);
}

const newestDate = data[data.length - 1][6];
const oldestDate = data[0][6];
console.log(newestDate);
console.log(oldestDate);

function createDateRange(oldestDate: Date, newestDate: Date) {
  const date = new Date(oldestDate);
  const range: Date[] = [];
  while (date < newestDate) {
    range.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return range;
}

const dateRange = createDateRange(
  new Date(oldestDate),
  new Date(newestDate)
).map(
  (date) =>
    `${date.getFullYear().toString().padStart(4, "0")}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
);

console.log(dateRange);

const items = data.map(([item]) => item);

console.log(items.length);

const uniqueItems = [...new Set(items)];
const receiptTensorDim = uniqueItems.length;

console.log(uniqueItems.length);

function vectorize(lines: string[][]) {
  const vector = Array.from<0 | 1>({ length: receiptTensorDim }).fill(0);
  for (const [item] of lines) {
    vector[uniqueItems.indexOf(item)] = 1;
  }
  return vector;
}

const formattedData = dateRange.map((date) =>
  vectorize(dateToLine.get(date) ?? [])
);

const inputData = [...formattedData.slice(inputSpan).keys()].map((i) =>
  formattedData.slice(i, i + inputSpan)
);
const outputData = formattedData.slice(inputSpan);

function modeling() {
  // Define a model for linear regression.
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [receiptTensorDim, inputSpan],
      units: 1,
    })
  );

  model.add(tf.layers.flatten());

  model.compile({ loss: "meanSquaredError", optimizer: "sgd" });

  // Generate some synthetic data for training.
  const xs = tf.tensor3d(inputData, [
    inputData.length,
    receiptTensorDim,
    inputSpan,
  ]);
  const ys = tf.tensor2d(outputData, [inputData.length, receiptTensorDim]);

  console.log("training");
  console.log(inputData[0].length);
  // Train the model using the data.
  model.fit(xs, ys, { epochs: 10 }).then(() => {
    const input = [formattedData.slice(formattedData.length - inputSpan)];
    console.log(input.length);
    const predictedReceipt = (
      model.predict(
        tf.tensor3d(input, [1, inputSpan, receiptTensorDim])
      ) as tf.Tensor3D
    )
      .arraySync()[0][0]
      .map((value, index) => ({ value, item: uniqueItems[index] }))
      .filter(({ value }) => value > 0.5)
      .map(({ item }) => item)
      .join("\n");
    console.log(predictedReceipt);
  });
}

// modeling();

function modeling2() {
  // Define your data and labels here. inputData is a 3D tensor (num_samples x sequence_length x input_features).
  // labels is a 2D tensor (num_samples x input_features).
  const sequenceLength = inputSpan;
  const inputFeatures = receiptTensorDim;

  // Create the RNN model
  const model = tf.sequential();

  // Add an LSTM layer with 64 units. You can adjust the number of units as needed.
  model.add(
    tf.layers.lstm({
      units: 2,
      inputShape: [sequenceLength, inputFeatures],
      returnSequences: false,
    })
  );

  // Add a dense layer to produce the output vector.
  model.add(tf.layers.dense({ units: inputFeatures, activation: "linear" }));

  // Compile the model
  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError", // You can choose an appropriate loss function
  });

  // Train the model
  const epochs = 10; // Adjust the number of epochs as needed
  const batchSize = 8; // Adjust the batch size as needed

  // Train the model with your inputData and labels
  const numSamples = inputData.length;
  const inputData2 = tf.tensor(inputData, [
    numSamples,
    sequenceLength,
    inputFeatures,
  ]);
  console.log(
    "inputData shape",
    tf.randomNormal([numSamples, sequenceLength, inputFeatures]).shape
  );
  console.log("inputData2", inputData2.shape);
  const labels = tf.tensor(outputData, [numSamples, inputFeatures]);
  console.log(
    "labels shape",
    tf.randomNormal([numSamples, inputFeatures]).shape
  );
  model
    .fit(inputData2, labels, {
      epochs,
      batchSize,
    })
    .then((info) => {
      console.log("Training complete");
      // Make a prediction using the last 15 vectors
      const last15Vectors = tf.tensor(
        [
          [
            ...(inputData.pop() as (0 | 1)[][]).slice(2),
            Array.from({ length: inputFeatures }).map(() => 0),
            Array.from({ length: inputFeatures }).map(() => 0),
          ],
        ],
        [1, sequenceLength, inputFeatures]
      ); // Prepare your input data

      // Assuming your `last15Vectors` is a 3D tensor with shape (1, sequenceLength, inputFeatures)
      const predictedVector = model.predict(last15Vectors);
      const predictedItems = (predictedVector as tf.Tensor).arraySync()[0].map((v, i) => [v, uniqueItems[i]]).sort(([v0, ], [v1, ]) => v1 - v0).map(([, item]) => item);
      console.log(predictedItems.slice(0, 20));
      console.log(predictedItems.slice(-1 * 20));
    });
}

modeling2();
