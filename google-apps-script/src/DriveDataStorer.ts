namespace DriveDataStorer {
  const sheetName = "ReceiptLine";
  const spreadsheetId = "1x_uln6FPZ2cvUlhar8wk-ZmrlaxECgQSOH_pqQs221I";

  type FormattedReceiptLine = [string, string, string, string, string, string];

  export const write = (receiptLines: ReceiptLine[]) => {
    const append = Sheets.Spreadsheets?.Values?.append;
    if (append === undefined) {
      throw new Error("Drive API unavailable.");
    }
    const values = receiptLines.map(formatReceiptLine);
    append({ values }, spreadsheetId, sheetName, {
      valueInputOption: "USER_ENTERED",
    });
  };

  export const read = () => {
    const get = Sheets.Spreadsheets?.Values?.get;
    if (get === undefined) {
      throw new Error("Drive API unavailable.");
    }
    const values = get(spreadsheetId, "ReceiptLine!A2:F")
      .values as FormattedReceiptLine[];
    return values.map(parseReceiptLine);
  };

  type FormatReceiptLine = (line: ReceiptLine) => FormattedReceiptLine;

  const formatReceiptLine: FormatReceiptLine = ({
    itemLabel,
    quantity,
    vat,
    unitPrice,
    amount,
    date,
  }) => [itemLabel, quantity, vat, unitPrice, amount, date];

  type ParseReceiptLine = (line: FormattedReceiptLine) => ReceiptLine;

  const parseReceiptLine: ParseReceiptLine = ([
    itemLabel,
    quantity,
    vat,
    unitPrice,
    amount,
    date,
  ]) => ({
    itemLabel,
    quantity,
    vat,
    unitPrice,
    amount,
    date,
  });
}

namespace DataStorage {
  const docId = "1whQ3g3txfRHlrDqF1EyhOnJgSwdgtlogVHPjXjQjUEU";

  export function storeGroceriesList(list: string[]) {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    const existingChildrenCount = body.getNumChildren();
    for (const item of list) {
      body.appendListItem(item);
    }
    for (let i = 0; i < existingChildrenCount; i++) {
      body.getChild(i).removeFromParent();
    }
    doc.saveAndClose();
  }
}
