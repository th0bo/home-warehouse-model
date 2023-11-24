const logReceipts = <T extends FetchedReceipt>(
  fetch: FetchReceipts<T>,
  parse: ParseReceipt
) => {
  for (const receipt of fetch().map(({ data }) => parse(data))) {
    Logger.log(JSON.stringify(receipt));
  }
};

const logGmailReceipts = () => {
  logReceipts(GmailReceiptFetcher.fetch, GmailReceiptParser.parse);
};

const logDriveReceipts = () => {
  logReceipts(DriveReceiptFetcher.fetch, DriveReceiptParser.parse);
};

const logRegressions = () => {
  for (const { label, diff, meanDy } of Stats.computeRegressions(
    DriveDataStorer.read().map(({ itemLabel, ...rest }) => ({
      itemLabel,
      ...rest,
      commonLabel: itemLabel,
    }))
  )) {
    Logger.log(`${label} ${diff} / ${meanDy}`);
  }
};

const logLabelledThreadsIds = () => {
  Logger.log(
    JSON.stringify(
      GmailApp.getInboxThreads()
        .filter((thread) =>
          thread
            .getLabels()
            .map((label) => label.getName())
            .includes("scripting")
        )
        .map((thread) => thread.getId())
    )
  );
};

const logStoredReceiptLines = () => {
  Logger.log(JSON.stringify(DriveDataStorer.read()));
}

const logDriveFileId = () => {
  const fileName = "";
  const i = DriveApp.getFilesByName(fileName);
  const ids: string[] = [];
  while (i.hasNext) {
    ids.push(i.next().getId());
  }
  Logger.log(JSON.stringify(ids));
}