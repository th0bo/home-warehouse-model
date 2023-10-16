namespace DataStorage {
  const spreadsheetFileName = "Testing";
  const sheetName = spreadsheetFileName;
  const spreadsheetId = "1x_uln6FPZ2cvUlhar8wk-ZmrlaxECgQSOH_pqQs221I";

  export function storeItemLines(itemLines: string[][]) {
    Sheets.Spreadsheets?.Values?.append(
      { values: itemLines },
      spreadsheetId,
      sheetName,
      { valueInputOption: "RAW" }
    );
  }
}
