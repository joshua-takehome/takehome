import React from "react";
import { Flex, CircularProgress, Text } from "@chakra-ui/react";

//     _    ____ ___
//    / \  |  _ \_ _|
//   / _ \ | |_) | |
//  / ___ \|  __/| |
// /_/   \_\_|  |___|

// The key is the name of the charge; the value is the price.
type Charge = Record<string, string>;

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

const fetchInvoices = async (): Promise<Invoice[]> => {
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

// ____                 _
// |  _ \ ___  __ _  ___| |_
// | |_) / _ \/ _` |/ __| __|
// |  _ <  __/ (_| | (__| |_
// |_| \_\___|\__,_|\___|\__|

type InvoiceState =
  | { type: "INVOICES_LOADING" }
  | { type: "INVOICE_FETCH_ERROR" }
  | { type: "INVOICE_FETCH_SUCCESS"; payload: Invoice[] };

const InvoiceStateContext = React.createContext<InvoiceState | null>(null);

export const useInvoices = () => {
  const ctx = React.useContext(InvoiceStateContext);
  if (ctx === null || ctx.type !== "INVOICE_FETCH_SUCCESS") {
    throw new Error(
      "Please only use useInvoices inside the invoice state provider."
    );
  }
  return ctx;
};

interface InvoiceStateProviderProps {
  children: React.ReactNode;
}

export const InvoiceStateProvider = (props: InvoiceStateProviderProps) => {
  const { children } = props;
  const [invoiceState, setInvoiceState] = React.useState<InvoiceState>({
    type: "INVOICES_LOADING",
  });
  React.useEffect(() => {
    const loadInvoices = async () => {
      if (invoiceState.type !== "INVOICES_LOADING") {
        return;
      }
      try {
        const invoices = await fetchInvoices();
        setInvoiceState({ type: "INVOICE_FETCH_SUCCESS", payload: invoices });
      } catch (err) {
        setInvoiceState({ type: "INVOICE_FETCH_ERROR" });
      }
    };
    loadInvoices();
  }, []);
  switch (invoiceState.type) {
    case "INVOICES_LOADING": {
      return (
        <Flex justifyContent="center" width="100%" my="16px">
          <CircularProgress size={24} isIndeterminate />
        </Flex>
      );
    }
    case "INVOICE_FETCH_ERROR": {
      return (
        <Flex justifyContent="center" width="100%" my="16px">
          <Text maxWidth="600px">
            An error occurred when trying to fetch the invoices. Please refresh
            the page and try again.
          </Text>
        </Flex>
      );
    }
    case "INVOICE_FETCH_SUCCESS": {
      return <>{children}</>;
    }
  }
};
