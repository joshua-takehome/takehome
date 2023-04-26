import React from "react";
import { Invoice, Charge } from "./api";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { produce } from "immer";

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

type ChargeModalState =
  | { isOpen: false; charges: null; idx: null }
  | { isOpen: true; charges: Array<Charge>; idx: number };

interface ChargeModalBodyProps {
  onClose: () => void;
  charges: Array<Charge> | null;
  idx: number | null;
}

const ChargeFormModalBody = (props: ChargeModalBodyProps) => {
  const { form, setForm } = useInvoiceForm();
  const { onClose, charges, idx } = props;
  if (charges === null || idx === null) return null;
  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Charges for {form[idx].name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Price</Th>
                </Tr>
              </Thead>
              <Tbody>
                {charges.map((charge) => {
                  const name = Object.keys(charge)[0];
                  return (
                    <Tr>
                      <Td>
                        <Input value={name} />
                      </Td>
                      <Td>
                        <Input value={charge[name]} />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
};

const InvoiceTableFormBody = () => {
  const { form, setForm } = useInvoiceForm();
  const [modalState, setModalState] = React.useState<ChargeModalState>({
    isOpen: false,
    charges: null,
    idx: null,
  });
  const closeModal = () => {
    setModalState({ charges: null, isOpen: false, idx: null });
  };
  return (
    <>
      {form.map((invoice, idx) => {
        return (
          <Tr key={invoice.id}>
            <Td>{invoice.id}</Td>
            <Td>
              <Input
                value={invoice.name}
                onChange={(e) => {
                  setForm((prev) => {
                    return produce(prev, (draft) => {
                      draft[idx].name = e.target.value;
                    });
                  });
                }}
              />
            </Td>
            <Td>
              <Select
                onChange={(e) => {
                  setForm((prev) => {
                    return produce(prev, (draft) => {
                      draft[idx].status = e.target.value;
                    });
                  });
                }}
                value={invoice.status}
              >
                {STATUSES.map((status) => {
                  return (
                    <option key={status.value} value={status.value}>
                      {status.display}
                    </option>
                  );
                })}
              </Select>
            </Td>
            <Td>
              <Input
                onChange={(e) => {
                  setForm((prev) => {
                    return produce(prev, (draft) => {
                      draft[idx].due_date = e.target.value;
                    });
                  });
                }}
                value={invoice.due_date}
                type="date"
              />
            </Td>
            <Td>
              <Button
                onClick={() => {
                  setModalState({
                    isOpen: true,
                    charges: form[idx].charges,
                    idx: idx,
                  });
                }}
              >
                View Charges
              </Button>
            </Td>
          </Tr>
        );
      })}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => {
          setModalState({ charges: null, isOpen: false, idx: null });
        }}
      >
        <ChargeFormModalBody
          charges={modalState.charges}
          idx={modalState.idx}
          onClose={closeModal}
        />
      </Modal>
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
          <Button
            onClick={() => {
              return setFormState((prev) => {
                return produce(prev, (draft) => {
                  draft.push({
                    id: prev.length + 1,
                    charges: [],
                    name: "Untitled",
                    due_date: "",
                    status: "draft",
                  });
                });
              });
            }}
            mr="16px"
            colorScheme="green"
          >
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
