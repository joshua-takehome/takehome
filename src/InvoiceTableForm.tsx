import React from "react";
import { Invoice } from "./api";
import { useInvoices } from "./InvoiceApiProvider";
import {
  Flex,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Select,
  Button,
} from "@chakra-ui/react";

interface InvoiceFormContext {
  form: Invoice[];
  setForm: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

const InvoiceFormContext = React.createContext<InvoiceFormContext | null>(null);

const STATUSES = [
  { value: "draft", display: "Draft" },
  { value: "outstanding", display: "Outstanding" },
  { value: "paid", display: "Paid" },
];

const useInvoiceForm = (): InvoiceFormContext => {
  const ctx = React.useContext(InvoiceFormContext);
  if (ctx === null) {
    throw new Error("Please use useInvoiceForm inside of its provider.");
  }
  return ctx;
};

const InvoiceTableFormBody = () => {
  const { form, setForm } = useInvoiceForm();
  console.log(form);
  return (
    <>
      {form.map((invoice, idx) => {
        return (
          <Tr key={invoice.id}>
            <Td>{invoice.id}</Td>
            <Td>
              <Input value={invoice.name} />
            </Td>
            <Td>
              <Select value={invoice.status}>
                {STATUSES.map((status) => {
                  return <option value={status.value}>{status.display}</option>;
                })}
              </Select>
            </Td>
            <Td>
              <Input value={invoice.due_date} type="date" />
            </Td>
            <Td>
              <Button>View Charges</Button>
            </Td>
          </Tr>
        );
      })}
    </>
  );
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
      <Flex m={4} direction="column" width="100%" maxWidth="1200px">
        <Flex width="100%" justifyContent="center">
          <Heading>Invoices</Heading>
        </Flex>
        <Flex my="16px">
          <Button mr="16px" colorScheme="green">
            Create
          </Button>
          <Button colorScheme="teal">Save</Button>
        </Flex>
        <TableContainer>
          <Table variant="simple">
            <TableCaption>Edit the entries in the table directly.</TableCaption>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Due Date</Th>
                <Th>Charges</Th>
              </Tr>
            </Thead>
            <Tbody>
              <InvoiceTableFormBody />
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </InvoiceFormContext.Provider>
  );
};