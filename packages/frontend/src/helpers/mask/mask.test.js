import maskCapitalize from "./mask-capitalize";
import maskCep from "./mask-cep";
import maskCNPJ from "./mask-cnpj";
import maskCode from "./mask-code";
import maskCPF from "./mask-cpf";
import maskPhone from "./mask-phone";


describe("maskCapitalize", () => {
  test("returns first letter Uppercase", () => {
    const res = maskCapitalize("test");
    expect(res).toBe("Test");
  });
});

describe("maskCep", () => {
  test("returns nothing without cep", () => {
    const res = maskCep("");
    expect(res).toBe("");
  });
  test("returns masked cep", () => {
    const res = maskCep("11222333");
    expect(res).toBe("11.222-333");
  });
});

describe("maskCNPJ", () => {
  test("returns masked CNPJ", () => {
    const res = maskCNPJ("11222333/444455");
    expect(res).toBe("11.222.333/4444-55");
  });
});

describe("maskCode", () => {
  test("returns masked codee", () => {
    const res = maskCode("  111 222   ");
    expect(res).toBe("111222");
  });
});

describe("maskCPF", () => {
  test("returns masked CPF", () => {
    const res = maskCPF("11122233344");
    expect(res).toBe("111.222.333-44");
  });
});

describe("maskPhone", () => {
  test("returns initial masked phone code", () => {
    const res = maskPhone("1");
    expect(res).toBe("(1");
  });
  test("returns masked phone code", () => {
    const res = maskPhone("114");
    expect(res).toBe("(11) 4");
  });
  test("returns masked phone", () => {
    const res = maskPhone("1144442222");
    expect(res).toBe("(11) 4444-2222");
  });
  test("returns masked mobile phone", () => {
    const res = maskPhone("11444442222");
    expect(res).toBe("(11) 44444-2222");
  });
});