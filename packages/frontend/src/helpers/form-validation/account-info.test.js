import accountInfoValidate from "./account-info";

const data = {
  name: "Name",
  documentType: "CPF",
  document: "893.458.220-03",
  email: "test@test.com",
  phoneCode: "+1",
  phone: "(11) 22222-3333",
  addressZipCode: "11.222-333",
  addressState: "AA",
  addressCity: "City",
  addressStreet: "Test Street",
  addressNeighborhood: "Suburb",
};

describe("accountInfoValidate", () => {
  let setError, t;

  beforeEach(() => {
    setError = jest.fn();
    t = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when all fields are valid", () => {
    const result = accountInfoValidate(data, setError, t);
    expect(t).not.toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should return false and set error message when name is invalid", () => {
    const result = accountInfoValidate({ ...data, name: "aa" }, setError, t);
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when documentType is null", () => {
    const result = accountInfoValidate(
      { ...data, documentType: null },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when documentType is CPF document is invalid", () => {
    const result = accountInfoValidate(
      { ...data, document: "893.458.220-05" },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when document is invalid", () => {
    const result = accountInfoValidate(
      { ...data, documentType: "CNPJ", document: "45.039.237/0001-15" },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when email is invalid", () => {
    const result = accountInfoValidate(
      { ...data, email: "test@test" },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when phoneCode is null", () => {
    const result = accountInfoValidate(
      { ...data, phoneCode: null },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when phone is invalid", () => {
    const result = accountInfoValidate(
      { ...data, phone: "112222333" },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when addressZipCode is invalid", () => {
    const result = accountInfoValidate(
      { ...data, addressZipCode: "8888888" },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  
  it("should return false and set error message when addressState is null", () => {
    const result = accountInfoValidate(
      { ...data, addressState: null },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  
  it("should return false and set error message when addressCity is null", () => {
    const result = accountInfoValidate(
      { ...data, addressCity: null },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  
  it("should return false and set error message when addressStreet is null", () => {
    const result = accountInfoValidate(
      { ...data, addressStreet: null },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when addressNeighborhood is null", () => {
    const result = accountInfoValidate(
      { ...data, addressNeighborhood: null },
      setError,
      t
    );
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
