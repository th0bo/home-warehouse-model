type BuildReceiptItemLines = (receipt: ParsedReceipt) => ReceiptLine[];

namespace ReceiptItemLineBuilder {
  export const build: BuildReceiptItemLines = ({ lines, date }) =>
    lines.map(([itemLabel, quantity, vat, unitPrice, amount]) => ({
      itemLabel,
      quantity,
      vat,
      unitPrice,
      amount,
      date,
    }));
}
