import React from "react";
import { Invoice } from "./api";
import { useInvoices } from "./InvoiceApiProvider";
import { Flex, Heading, Text } from "@chakra-ui/react";

interface InvoiceFormContext {
  form: Invoice[];
  setForm: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

const InvoiceFormContext = React.createContext<InvoiceFormContext | null>(null);

const useInvoiceForm = (): InvoiceFormContext => {
  const ctx = React.useContext(InvoiceFormContext);
  if (ctx === null) {
    throw new Error("Please use useInvoiceForm inside of its provider.");
  }
  return ctx;
};

export const InvoiceTableForm = () => {
  const initialInvoices = useInvoices();
  const [formState, setFormState] = React.useState<Invoice[]>(
    initialInvoices.payload
  );
  return (
    <InvoiceFormContext.Provider
      value={{ form: formState, setForm: setFormState }}
    >
      <Flex direction="column" alignItems="center" width="100%">
        <Heading my="16px">Invoices</Heading>
      </Flex>
    </InvoiceFormContext.Provider>
  );
};
