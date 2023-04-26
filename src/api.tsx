// The key is the name of the charge; the value is the price.
export type Charge = Record<string, string>;

export interface Invoice {
  id: number;
  due_date: string;
  name: string;
  status: string;
  charges: Charge[];
}

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

const fixDate = (invoice: Invoice): Invoice => {
  return {
    ...invoice,
    due_date: parseDate(invoice.due_date),
  };
};

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const res = await window.fetch(
    "https://takehome.api.bidsight.io/v1/invoices",
    {
      method: "GET",
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch invoices.");
  }
  const json: Invoice[] = await res.json();
  return json.map((apiResponse: Invoice) => {
    return fixDate(apiResponse);
  }) as Invoice[];
};
