import formatDate from "./format-date";
import formatValue from "./format-value";

describe("formatDate", () => {
  test("returns date when receive timestamp", () => {
    const res = formatDate("1701115276");
    expect(res).toBe("27/11/2023 17:01");
  });

});

describe("formatValue", () => {
  test("returns R$ from value", () => {
    const res = formatValue("1050.99");
    expect(res).toBe("R$ 1.050,99");
  });
});
