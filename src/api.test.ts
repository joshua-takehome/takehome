import { parseDate, sumCharges } from "./api";

describe("Our date parsing", () => {
  test("Works on an empty string", () => {
    const res = parseDate("");
    expect(res).toEqual("");
  });
  test("Works on a real date", () => {
    const res = parseDate("03/27/2023");
    expect(res).toEqual("2023-03-27");
  });
});

describe("Summing up the charges for an invoice", () => {
  test("Works when there are none", () => {
    const res = sumCharges([]);
    expect(res).toEqual(0);
  });
  test("Works when there are a few", () => {
    const res = sumCharges([
      { id: "1", name: "test", value: "10.00" },
      { id: "1", name: "test", value: "10.00" },
    ]);
    expect(res).toEqual(20);
  });
});
