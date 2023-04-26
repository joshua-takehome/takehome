// The key is the name of the charge; the value is the price.
export type ApiCharge = Record<string, string>;

export interface Charge {
  id: string;
  name: string;
  value: string;
}

export interface InvoiceBase {
  id: number;
  due_date: string;
  name: string;
  status: string;
}

export interface InvoiceApi extends InvoiceBase {
  charges: ApiCharge[];
}

export interface Invoice extends InvoiceBase {
  charges: Charge[];
}

/**
 * The charges that the API returns are somewhat difficult to handle
 * because they lack IDs; here we map them to a form more amenable
 * to the UI.
 */
const mapCharge = (charge: ApiCharge): Charge => {
  const id = window.crypto.randomUUID();
  const name = Object.keys(charge)[0];
  return {
    id,
    name,
    value: charge[name],
  };
};

/**
 * The browser likes dates that are of the form:
 * YYYY-MM-DD
 *
 * However, the API returns dates that are of the form:
 * MM/DD/YYYY
 *
 * Hence, we perform this conversion.
 */
export const parseDate = (apiDate: string): string => {
  if (!/\d\d\/\d\d\/\d\d\d\d/.test(apiDate)) return "";
  const [month, day, year] = apiDate.split("/");
  return `${year}-${month}-${day}`;
};

const mapInvoice = (invoice: InvoiceApi): Invoice => {
  return {
    ...invoice,
    due_date: parseDate(invoice.due_date),
    charges: invoice.charges.map((charge) => mapCharge(charge)),
  };
};

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const res = await window.fetch(
    "https://takehome.api.bidsight.io/v2/invoices",
    {
      method: "GET",
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch invoices.");
  }
  const json: InvoiceApi[] = await res.json();
  return json.map((apiResponse: InvoiceApi) => {
    return mapInvoice(apiResponse);
  }) as Invoice[];
};
