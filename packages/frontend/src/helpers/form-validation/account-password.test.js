import accountPasswordValidate from "./account-password";

describe("accountPasswordValidate", () => {
  let setError, t;

  beforeEach(() => {
    setError = jest.fn();
    t = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when both currentPwd and newPwd/repeatPwd are valid", () => {
    const result = accountPasswordValidate({
      currentPwd: "123456",
      newPwd: "123456",
      repeatPwd: "123456",
    }, setError, t);
    expect(setError).not.toHaveBeenCalled();
    expect(t).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should return false and set error message when currentPwd is invalid", () => {
    const result = accountPasswordValidate({
      currentPwd: "12345",
      newPwd: "123456",
      repeatPwd: "123456",
    }, setError, t);
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("should return false and set error message when newPwd/repeatPwd are invalid", () => {
    const result = accountPasswordValidate({
      currentPwd: "123456",
      newPwd: "123456",
      repeatPwd: "1234567",
    }, setError, t);
    expect(t).toHaveBeenCalled();
    expect(setError).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
