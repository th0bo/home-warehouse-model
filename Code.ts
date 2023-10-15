function myFunction() {
  for (const thread of GmailApp.getInboxThreads()) {
    const threadId = thread.getId();
    Logger.log(`${threadId}`);
    const messages = thread.getMessages();
    for (const message of messages) {
      const messageBody = message.getBody();
      const dateMatcher = messageBody.match(/\d{2}\/\d{2}\/\d{4}/);
      const date = dateMatcher?.[0];
      Logger.log(date);
      Logger.log(extractAllItemLines(messageBody));
    }
  }
}

function extractAllItemLines(messageBody: string) {
  return messageBody
    .split("\n")
    .map((messageBodyLine) =>
      messageBodyLine.match(
        /<tr.*?>.*?<td.*?>\s*([A-Z0-9 \.\-]*?)\s*<\/td>.*?<td.*?>\s*(\d+)\s*<\/td>.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>.*?<\/tr>/
      )
    )
    .filter((matcher) => matcher !== null)
    .map((matcher) => extractItemLine(matcher as RegExpMatchArray));
}

function extractItemLine(itemMatcher: RegExpMatchArray): ItemLine {
  return {
    itemLabel: itemMatcher[1],
    quantity: Number(itemMatcher[2]),
    vat: itemMatcher[3],
    unitPrice: extractAmount(itemMatcher[4]),
    price: extractAmount(itemMatcher[5]),
  };
}

function extractAmount(currencyText: string): Amount {
  const currencyMatch = currencyText.match(/(\d+,\d+).*([\€\$])/);
  if (currencyMatch === null) {
    throw new Error(`Can't extract amount from "${currencyText}".`);
  }
  return {
    value: Number(currencyMatch[1].replace(/,/g, ".")),
    currency: currencyMatch[2] as Currency,
  };
}
