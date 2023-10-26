function test() {
  Logger.log(getDriveFileId('Groceries List'));
  DataStorage.storeGroceriesList(["huile d'olive", "pommes", "pâtes"]);
}

namespace DataStorage {
  const spreadsheetFileName = "Testing";
  const sheetName = "ReceiptLine";
  const spreadsheetId = "1x_uln6FPZ2cvUlhar8wk-ZmrlaxECgQSOH_pqQs221I";
  const docId = "1whQ3g3txfRHlrDqF1EyhOnJgSwdgtlogVHPjXjQjUEU";

  export function storeItemLines(itemLines: string[][]) {
    Sheets.Spreadsheets?.Values?.append(
      { values: itemLines },
      spreadsheetId,
      sheetName,
      { valueInputOption: "USER_ENTERED" }
    );
  }

  export function storeGroceriesList(list: string[]) {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    body.editAsText().setText(list.join('\n'));
    doc.saveAndClose();
  }
}
