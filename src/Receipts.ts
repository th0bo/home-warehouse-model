function main() {
  const itemLinesByMessage: string[][][] = [];
  for (const thread of GmailApp.getInboxThreads().reverse()) {
    const messages = thread.getMessages();
    for (const message of messages) {
      if (Receipts.isReceipt(message)) {
        const messageBody = message.getBody();
        const itemLines = Receipts.extractItemLines(messageBody);
        itemLinesByMessage.push(itemLines);
        Receipts.archive(thread);
      }
    }
  }
  DataStorage.storeItemLines(itemLinesByMessage.flat());
}

namespace Receipts {
  const labelName = "receipts";
  const label = GmailApp.getUserLabelByName(labelName);

  const emailFrom = "contact@email.notification.supermarchesmatch.fr";
  const emailSubject = "Votre ticket de caisse";

  const dateRegExp = /(\d{2})\/(\d{2})\/(\d{4})/;
  const itemLineRegExp =
    /<tr.*?>.*?<td.*?>\s*([A-Z0-9 \.\-]*?)\s*<\/td>.*?<td.*?>\s*(\d+)\s*<\/td>.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>.*?<td.*?>(.*?)<\/td>.*?<\/tr>/;

  export function extractItemLines(messageBody: string) {
    const dateMatcher = messageBody.match(dateRegExp) as RegExpMatchArray;
    const date = `${dateMatcher[3]}-${dateMatcher[2]}-${dateMatcher[1]}`;
    return (
      messageBody
        .split("\n")
        .map((messageBodyLine) => messageBodyLine.match(itemLineRegExp))
        .filter((matcher) => matcher !== null) as RegExpMatchArray[]
    ).map((matcher) => buildItemLine(matcher, date));
  }

  function buildItemLine(matcher: RegExpMatchArray, date: string) {
    return [
      ...matcher.slice(1).map((value) => value.replace(/&nbsp;/g, " ")),
      date,
    ];
  }

  export function isReceipt(
    message: GoogleAppsScript.Gmail.GmailMessage
  ): boolean {
    return (
      message.getFrom().includes(emailFrom) &&
      message.getSubject().includes(emailSubject)
    );
  }

  export function archive(thread: GoogleAppsScript.Gmail.GmailThread) {
    thread.addLabel(label);
    thread.moveToArchive();
  }
}
