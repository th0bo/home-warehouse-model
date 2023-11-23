function test() {
  Logger.log(getDriveFileId('Groceries List'));
  // DataStorage.storeGroceriesList(["huile de sésame", "poires", "lentilles"]);
  DataStorage.retrieveItemLines();
}

namespace DataStorage {
  const spreadsheetFileName = "Testing";
  const sheetName = "ReceiptLine";
  const spreadsheetId = "1x_uln6FPZ2cvUlhar8wk-ZmrlaxECgQSOH_pqQs221I";
  const docId = "1whQ3g3txfRHlrDqF1EyhOnJgSwdgtlogVHPjXjQjUEU";

  export function retrieveItemLines() {
    const storedReceiptLines = (Sheets.Spreadsheets?.Values?.get(
      spreadsheetId,
      "ReceiptLine!A:F"
    ).values ?? []) as [string, string, string, string, string, string][];
    
    const labelToDataSet = new Map<string, Array<{ x: number, y: number }>>();
    const labels: string[] = [];

    for (const [label, , , , amount, date] of storedReceiptLines) {
      Logger.log(`${label} ${amount} ${date}`);
      const dateMatcher = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (dateMatcher !== null) {
        const day = Number(dateMatcher[1]);
        const monthIndex = Number(dateMatcher[2]) - 1;
        const year = Number(dateMatcher[3]);
        const x = new Date(year, monthIndex, day).getTime();
        const dy = parseFloat(amount.replace(/\s/g, "").replace(",", "."));

        const dataSet = (labelToDataSet.get(label) ?? (() => {
          labels.push(label);
          const newDataSet = [];
          labelToDataSet.set(label, newDataSet);
          return newDataSet;
        })());
        const y = dataSet.length === 0 ? dy : dataSet[dataSet.length - 1].y + dy;
        dataSet.push({ x, y });
      }
    }

    for (const label of [...labels]) {
      const dataSet = labelToDataSet.get(label);
      if (dataSet !== undefined && dataSet.length > 1) {
        /**
         * This value should give the value threshold of diff, when diff is near or higher
         * than this value a refill should be considered.
         */
        const meanY = dataSet.reduce((sum, { y }) => sum + y, 0) / dataSet.length;
        const { intercept, slope } = Stats.linearRegression(dataSet);
        const yForecast = intercept + slope * (new Date().getTime());
        const diff = yForecast - dataSet[dataSet.length - 1].y;
        Logger.log(`${label} ${diff} / ${meanY}`);
      }
    }
  }

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
