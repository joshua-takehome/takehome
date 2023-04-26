import React from "react";
import { Flex, CircularProgress, Text } from "@chakra-ui/react";
import { fetchInvoices, Invoice } from "./api";

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
      return (
        <InvoiceStateContext.Provider value={invoiceState}>
          {children}
        </InvoiceStateContext.Provider>
      );
    }
  }
};
