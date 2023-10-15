function myFunction() {
  const dataFile = DriveApp.getFilesByName("Testing").next();
  const itemLinesByMessage: string[][][] = [];
  for (const thread of GmailApp.getInboxThreads()) {
    const messages = thread.getMessages();
    for (const message of messages) {
      if (isReceipt(message)) {
        const messageBody = message.getBody();
        const itemLines = extractItemLines(messageBody);
        itemLinesByMessage.push(itemLines);
        archive(thread);
      }
    }
  }
  dataFile.setContent(itemLinesToCsv(itemLinesByMessage.flat()));
}

function itemLinesToCsv(itemLines: string[][]) {
  return itemLines.map((itemLine) => itemLine.join(";")).join("\n");
}

// function itemLinesToCsv(itemLines: ItemLine[]) {
//   return itemLines
//     .map((itemLine) =>
//       Object.values(itemLine)
//         .map((value) =>
//           typeof value === "object" ? Object.values(value).join(";") : value
//         )
//         .join(";")
//     )
//     .join("\n");
// }

function extractItemLines(messageBody: string) {
  const dateMatcher = messageBody.match(
    /(\d{2})\/(\d{2})\/(\d{4})/
  ) as RegExpMatchArray;
  const date = `${dateMatcher[3]}-${dateMatcher[2]}-${dateMatcher[1]}`;
  return (
    messageBody
      .split("\n")
      .map((messageBodyLine) =>
        messageBodyLine.match(
          /<tr.*?>.*?<td.*?>\s*([A-Z0-9 \.\-]*?)\s*<\/td>.*?<td.*?>\s*(\d+)\s*<\/td>.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>.*?<\/tr>/
        )
      )
      .filter((matcher) => matcher !== null) as RegExpMatchArray[]
  ).map((matcher) => buildItemLine(matcher, date));
}

function buildItemLine(matcher: RegExpMatchArray, date: string) {
  return [
    ...matcher.slice(1).map((value) => value.replace(/&nbsp;/g, " ")),
    date,
  ];
}

// function buildItemLine(matcher: RegExpMatchArray, date: string) {
//   return {
//     itemLabel: matcher[1],
//     quantity: Number(matcher[2]),
//     vat: matcher[3].replace(/&nbsp;/g, " "),
//     unitPrice: extractAmount(matcher[4]),
//     price: extractAmount(matcher[5]),
//     date,
//   };
// }

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

function isReceipt(message: GoogleAppsScript.Gmail.GmailMessage): boolean {
  return message
    .getFrom()
    .includes("contact@email.notification.supermarchesmatch.fr");
}

const label = GmailApp.getUserLabelByName("admin/courses");

function archive(thread: GoogleAppsScript.Gmail.GmailThread) {
  thread.addLabel(label);
  thread.moveToArchive();
}
