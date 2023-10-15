type Currency = "€" | "$";

interface Amount {
  value: number;
  currency: Currency;
}

interface ItemLine {
  itemLabel: string;
  quantity: number;
  vat: string;
  unitPrice: Amount;
  price: Amount;
}