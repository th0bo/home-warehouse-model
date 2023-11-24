const storeDriveReceipts = () => {
  for (const receipt of DriveReceiptFetcher.fetch().map(({ data }) =>
    DriveReceiptParser.parse(data)
  )) {
  }
};

const processGmailReceipts = () => {
  const gmailReceipts = GmailReceiptFetcher.fetch();

  DriveDataStorer.write(
    gmailReceipts
      .map(({ data }) =>
        ReceiptItemLineBuilder.build(GmailReceiptParser.parse(data))
      )
      .flat()
  );

  GmailReceiptFetcher.flagAsProcessed(gmailReceipts);
};

const addListAsTasks = () => {
  TasksGroceriesList.addItemsAsTasks([
    "bananes",
    "avoine",
    "oeufs",
    "lait",
    "yahourts",
    "pommes",
    "carottes",
  ]);
};
