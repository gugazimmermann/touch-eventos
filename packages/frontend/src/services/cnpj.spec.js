import fetchDataByCNPJ from "./cnpj";

const data = {
  name: "Name",
  email: "test@test.com",
  phone: "(11) 2222-3333",
  addressZipCode: "11.222-333",
  addressState: "AA",
  addressCity: "City",
  addressStreet: "Street",
  addressNumber: "456",
  addressNeighborhood: "Neighborhood",
  addressComplement: "Apt 111",
  addressLatitude: "0.0",
  addressLongitude: "1.1",
};

const mockCNPJResponse = {
  nome_fantasia: "FANTASY NAME",
  razao_social: "COMPANY NAME",
  email: "test@test2.com",
  ddd_telefone_1: "(44) 5555-6666",
  numero: "789",
  complemento: "Apt 222",
  cep: "44.555-666",
};

const mockCepResponse = {
  cep: "77.888-999",
  state: "BB",
  city: "City 2",
  street: "Street 2",
  neighborhood: "Neighborhood 2",
  location: {
    coordinates: {
      longitude: "3.3",
      latitude: "4.4",
    },
  },
};

describe("fetchDataByCNPJ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return data if the CNPJ is invalid", async () => {
    jest
      .spyOn(global, "fetch")
      .mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({}) })
      );
    const result = await fetchDataByCNPJ("45.039.237/0001-1", data);
    expect(result).toEqual(data);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should fetch and update data if the CNPJ is valid", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockCNPJResponse),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockCepResponse),
      });
    const result = await fetchDataByCNPJ("45.039.237/0001-14", data);
    expect(result.name).toBe("Fantasy Name");
    expect(result.email).toBe("test@test2.com");
    expect(result.phone).toBe("(44) 5555-6666");
    expect(result.addressNumber).toBe("789");
    expect(result.addressComplement).toBe("Apt 222");
    expect(result.addressZipCode).toBe("77.888-999");
    expect(result.addressState).toBe("BB");
    expect(result.addressCity).toBe("City 2");
    expect(result.addressStreet).toBe("Street 2");
    expect(result.addressNeighborhood).toBe("Neighborhood 2");
    expect(result.addressLatitude).toBe("3.3");
    expect(result.addressLongitude).toBe("4.4");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://brasilapi.com.br/api/cnpj/v1/45039237000114"
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://brasilapi.com.br/api/cep/v2/44.555-666"
    );
  });

  test("should fetch and update data if the CNPJ is valid and nome_fantasia is null", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        json: jest
          .fn()
          .mockResolvedValue({ ...mockCNPJResponse, nome_fantasia: null }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockCepResponse),
      });
    const result = await fetchDataByCNPJ("45.039.237/0001-14", data);
    expect(result.name).toBe("Company Name");
  });

  test("should fetch and update data if the CNPJ is valid and email is null", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ ...mockCNPJResponse, email: null }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockCepResponse),
      });
    const result = await fetchDataByCNPJ("45.039.237/0001-14", data);
    expect(result.email).toBe("");
  });

  test("should fetch and update data if the CNPJ is valid and dataCep.cep is null", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockCNPJResponse),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ ...mockCepResponse, cep: null }),
      });
    const result = await fetchDataByCNPJ("45.039.237/0001-14", data);
    expect(result.addressZipCode).toBe("44.555-666");
  });

  test("should not update data if res.type is truthy", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ type: "someType" }),
    });
    const result = await fetchDataByCNPJ("45.039.237/0001-14", data);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(data);
  });

  test("should not update data if res?.cep is null", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ ...mockCNPJResponse, cep: null }),
    });
    const result = await fetchDataByCNPJ("45.039.237/0001-14", data);
    expect(result.addressLatitude).toBe(data.addressLatitude);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("should not update data if dataCep.type is truthy", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockCNPJResponse),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ type: "someType" }),
      });
    const result = await fetchDataByCNPJ("45.039.237/0001-14", data);
    expect(result.addressLatitude).toBe(data.addressLatitude);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
