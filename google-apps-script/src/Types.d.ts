type Currency = "€" | "$";

interface Amount {
  value: number;
  currency: Currency;
}

interface ReceiptLine {
  itemLabel: string;
  quantity: string;
  vat: string;
  unitPrice: string;
  amount: string;
  date: string;
}

interface ListItem {
  commonLabel: string;
  weight: number;
}

type MatchedReceiptItemLine = ReceiptLine & ListItem;

/**
 * label, quantity, vat, unitPrice, amount
 */
type ParsedReceiptLine = [string, string, string, string, string];

interface ParsedReceipt {
  lines: ParsedReceiptLine[];
  date: string;
}

type ParseReceipt = (receipt: string) => ParsedReceipt;

interface FetchedReceipt {
  data: string;
}

type FetchReceipts<T extends FetchedReceipt> = () => T[];