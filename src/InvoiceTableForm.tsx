import React from "react";
import { Invoice, Charge, sumCharges, STATUSES } from "./api";
import { useInvoices } from "./InvoiceApiProvider";
import {
  Flex,
  Heading,
  Text,
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
  Checkbox,
} from "@chakra-ui/react";
import { produce } from "immer";

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

type ChargeModalState =
  | { isOpen: false; charges: null; idx: null }
  | { isOpen: true; charges: Array<Charge>; idx: number };

interface ChargeModalBodyProps {
  onClose: () => void;
  idx: number | null;
}

const ChargeFormModalBody = (props: ChargeModalBodyProps) => {
  const { form, setForm } = useInvoiceForm();
  const { onClose, idx } = props;
  if (idx === null) return null;
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
                  <Th>Delete</Th>
                </Tr>
              </Thead>
              <Tbody>
                {form[idx].charges.map((charge, chargeIdx) => {
                  return (
                    <Tr key={charge.id}>
                      <Td>
                        <Input
                          onChange={(e) => {
                            setForm((prev) => {
                              return produce(prev, (draft) => {
                                draft[idx].charges[chargeIdx].name =
                                  e.target.value;
                              });
                            });
                          }}
                          value={charge.name}
                        />
                      </Td>
                      <Td>
                        <Input
                          onChange={(e) => {
                            setForm((prev) => {
                              return produce(prev, (draft) => {
                                draft[idx].charges[chargeIdx].value =
                                  e.target.value;
                              });
                            });
                          }}
                          value={charge.value}
                        />
                      </Td>
                      <Td>
                        <Button
                          onClick={() => {
                            setForm((prev) => {
                              return produce(prev, (draft) => {
                                draft[idx].charges = draft[idx].charges.filter(
                                  (aCharge) => aCharge.id !== charge.id
                                );
                              });
                            });
                          }}
                          colorScheme="red"
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            mr={3}
            onClick={() => {
              return setForm((prev) => {
                return produce(prev, (draft) => {
                  draft[idx].charges.push({
                    id: window.crypto.randomUUID(),
                    name: "Untitled",
                    value: "0.00",
                  });
                });
              });
            }}
          >
            Add Charge
          </Button>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
};

interface InvoiceTableFormBodyProps {
  setModalState: React.Dispatch<React.SetStateAction<ChargeModalState>>;
  nameFilter: string;
  statusFilter: string;
  onlyShowLate: boolean;
}

const InvoiceTableFormBody = (props: InvoiceTableFormBodyProps) => {
  const { setModalState, nameFilter, onlyShowLate, statusFilter } = props;
  const { form, setForm } = useInvoiceForm();
  return (
    <>
      {form.map((invoice, idx) => {
        /* TODO: The logic for these filters should be extracted out and unit tested. */
        if (statusFilter !== "" && invoice.status !== statusFilter) {
          return null;
        }
        if (
          nameFilter !== "" &&
          !invoice.name.toLowerCase().includes(nameFilter.toLowerCase())
        ) {
          return null;
        }
        const isLate =
          invoice.status === "outstanding" &&
          Date.parse(invoice.due_date) < Date.now();
        if (onlyShowLate && !isLate) {
          return null;
        }
        const currentCharges = form[idx].charges;
        const sum = sumCharges(currentCharges);
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
            <Td>${sum}</Td>
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
            <Td>
              <Button
                onClick={() => {
                  setForm((prev) => {
                    const newForm = prev.filter((x) => x.id !== invoice.id);
                    return newForm;
                  });
                }}
                colorScheme="red"
              >
                Delete
              </Button>
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
  const [modalState, setModalState] = React.useState<ChargeModalState>({
    isOpen: false,
    charges: null,
    idx: null,
  });
  const [nameFilter, setNameFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [onlyShowLate, setOnlyShowLate] = React.useState<boolean>(false);
  const closeModal = () => {
    setModalState({ charges: null, isOpen: false, idx: null });
  };
  return (
    <InvoiceFormContext.Provider
      value={{ form: formState, setForm: setFormState }}
    >
      <Flex m={4} direction="column" width="100%" maxWidth="1200px">
        <Flex width="100%" justifyContent="center">
          <Heading>Invoices</Heading>
        </Flex>
        {/* TODO: If I had more time, I would extract out these filters out into a separate component. */}
        <Flex my="16px">
          <Button
            onClick={() => {
              return setFormState((prev) => {
                return produce(prev, (draft) => {
                  draft.unshift({
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
          <Flex mr="16px">
            <Input
              placeholder="Filter By Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </Flex>
          <Flex mr="16px">
            <Select
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              value={statusFilter}
            >
              {[{ value: "", display: "None" }, ...STATUSES].map((status) => {
                return (
                  <option key={status.value} value={status.value}>
                    {status.display}
                  </option>
                );
              })}
            </Select>
            <Flex direction="column" ml="16px" width="300px" height="50px">
              <Text>Only show late</Text>
              <Checkbox
                isChecked={onlyShowLate}
                onChange={() => {
                  setOnlyShowLate((prev) => !prev);
                }}
              />
            </Flex>
          </Flex>
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
                <Th>Amount</Th>
                <Th>Charges</Th>
                <Th>Delete</Th>
              </Tr>
            </Thead>
            <Tbody>
              <InvoiceTableFormBody
                nameFilter={nameFilter}
                statusFilter={statusFilter}
                onlyShowLate={onlyShowLate}
                setModalState={setModalState}
              />
            </Tbody>
          </Table>
        </TableContainer>
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => {
            setModalState({ charges: null, isOpen: false, idx: null });
          }}
        >
          <ChargeFormModalBody idx={modalState.idx} onClose={closeModal} />
        </Modal>
      </Flex>
    </InvoiceFormContext.Provider>
  );
};
