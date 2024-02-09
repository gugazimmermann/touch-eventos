// fetchDataByCEP.test.js
import fetchDataByCEP from "./cep";

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

describe("fetchDataByCEP", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return data if the CEP is invalid", async () => {
    jest
      .spyOn(global, "fetch")
      .mockImplementation(() =>
        Promise.resolve({ json: () => Promise.resolve({}) })
      );
    const res = await fetchDataByCEP("123", data);
    expect(res).toEqual(data);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should not update data if the CEP is valid and response type is present", async () => {
    const mockResponseWithType = {
      type: "SomeType",
    };
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponseWithType),
    });
    const res = await fetchDataByCEP("12.3456-78", data);
    expect(res).toEqual(data);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://brasilapi.com.br/api/cep/v2/12345678"
    );
  });

  test("should fetch and update data if the CEP is valid and response type is not present", async () => {
    const mockResponse = {
      state: "BB",
      city: "City 2",
      street: "Test Street 2",
      neighborhood: "Suburb 2",
      location: {
        coordinates: {
          latitude: "11.11",
          longitude: "22.22",
        },
      },
    };
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const res = await fetchDataByCEP("12.3456-78", data);
    expect(res.addressState).toBe(mockResponse.state);
    expect(res.addressCity).toBe(mockResponse.city);
    expect(res.addressStreet).toBe(mockResponse.street);
    expect(res.addressNeighborhood).toBe(mockResponse.neighborhood);
    expect(res.addressLatitude).toBe(
      mockResponse.location.coordinates.latitude
    );
    expect(res.addressLongitude).toBe(
      mockResponse.location.coordinates.longitude
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://brasilapi.com.br/api/cep/v2/12345678"
    );
  });

});
