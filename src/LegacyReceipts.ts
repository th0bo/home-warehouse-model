function extractAndStoreLegacyReceiptsData() {
  const folder = DriveApp.getFoldersByName("Receipts").next();
  const fileIterator = folder.getFiles();
  while (fileIterator.hasNext()) {
    const file = fileIterator.next();
    if (file.getName().startsWith("Votre ticket de caisse du")) {
      const itemLines = LegacyReceipts.extractItemLines(
        file.getBlob().getDataAsString()
      );
      DataStorage.storeItemLines(itemLines);
    }
    // while (fileIterator.hasNext()) {
    //   fileIterator.next();
    // }
  }
}

namespace LegacyReceipts {
  export function extractItemLines(str: string) {
    const dateMatcher = str.match(/(\d{2})\/(\d{2})\/(\d{4})/) as RegExpMatchArray;
    const date = `${dateMatcher[3]}-${dateMatcher[2]}-${dateMatcher[1]}`;
    let content = str
      .split("MES ARTICLES")[1]
      .split(/[\n\r]/)
      .join("");
    let matcher: RegExpMatchArray | null = null;
    const itemLines: string[][] = [];
    do {
      matcher = content.match(
        /([A-Z0-9\s\.\-]*?)  (\d+)  TVA=C2=A0(\d+,\d+)=C2=A0%  (\d+,\d+)=C2=A0=E2=82=AC  (\d+,\d+)=C2==A0=E2=82=AC(.+)/
      );
      if (matcher) {
        content = matcher[6];
        itemLines.push([
          matcher[1],
          matcher[2],
          `TVA ${matcher[3]} %`,
          `${matcher[4]} €`,
          `${matcher[5]} €`,
          date,
        ]);
      }
    } while (matcher);
    return itemLines;
  }
}
