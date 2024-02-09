import validateCep from "./validate-cep";
import validateCNPJ from "./validate-cnpj";
import validateCode from "./validate-code";
import validateCPF from "./validate-cpf";
import validateEmail from "./validate-mail";
import validateName from "./validate-name";
import validatePassword from "./validate-password";
import validatePhone from "./validate-phone";

describe("validateCep", () => {
  test("returns false for cep length less than 8", () => {
    const res = validateCep("8888888");
    expect(res).toBe(false);
  });

  test("returns true for valid cep", () => {
    const res = validateCep("88888888");
    expect(res).toBe(true);
  });
});

describe("validateCNPJ", () => {

  test("returns false for null CNPJ", () => {
    const res = validateCNPJ(null);
    expect(res).toBe(false);
  });

  test("returns false for invalid CNPJ", () => {
    const res = validateCNPJ("45.039.237/0001-15");
    expect(res).toBe(false);
  });

  test("returns true for valid CNPJ", () => {
    const res = validateCNPJ("45.039.237/0001-14");
    expect(res).toBe(true);
  });
});

describe("validateCode", () => {
  test("returns false for code length less than 6", () => {
    const res = validateCode("123");
    expect(res).toBe(false);
  });

  test("returns true for valid code", () => {
    const res = validateCode("123456");
    expect(res).toBe(true);
  });
});

describe("validateCPF", () => {

  test("returns false for null CPF", () => {
    const res = validateCPF(null);
    expect(res).toBe(false);
  });

  test("returns false for invalid CPF", () => {
    const res = validateCPF("893.458.220-06");
    expect(res).toBe(false);
  });

  test("returns true for valid CPF", () => {
    const res = validateCPF("893.458.220-03");
    expect(res).toBe(true);
  });
});

describe("validateEmail", () => {
  test("returns false for invalid email format", () => {
    const res1 = validateEmail("invalid");
    expect(res1).toBe(false);
    const res2 = validateEmail("invalid@email");
    expect(res2).toBe(false);
  });

  test("returns true for valid email format", () => {
    const res = validateEmail("valid@email.com");
    expect(res).toBe(true);
  });
});

describe("validatePassword", () => {
  test("returns false for password length less than 6", () => {
    const res = validatePassword("pass", "pass");
    expect(res).toBe(false);
  });

  test("returns false for passwords that do not match", () => {
    const res = validatePassword("password1", "password2");
    expect(res).toBe(false);
  });

  test("returns true for valid password", () => {
    const res = validatePassword("password", "password");
    expect(res).toBe(true);
  });

  test("returns true for valid password when repeat password is not provided", () => {
    const res = validatePassword("password");
    expect(res).toBe(true);
  });
});

describe("validateName", () => {
  test("returns false for name length less than 3", () => {
    const res = validateName("as");
    expect(res).toBe(false);
  });

  test("returns true for valid name", () => {
    const res = validateName("asl");
    expect(res).toBe(true);
  });
});

describe("validatePhone", () => {
  test("returns false for phone length less than 10", () => {
    const res = validatePhone("112222333");
    expect(res).toBe(false);
  });

  test("returns true for valid phone", () => {
    const res = validatePhone("11222223333");
    expect(res).toBe(true);
  });
});
