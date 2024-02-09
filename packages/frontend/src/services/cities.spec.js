import fetchCitiesByState from "./cities";

const state = "SP";

describe("fetchCitiesByState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch and return cities if the state is valid", async () => {
    const mockResponse = [
      { nome: "City1" },
      { nome: "City2" },
      { nome: "City3" },
    ];
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const result = await fetchCitiesByState(state);
    expect(result).toEqual(["City1", "City2", "City3"]);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://brasilapi.com.br/api/ibge/municipios/v1/${state}?providers=gov`
    );
  });

  test("should return an empty array if the state is invalid", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    });
    const result = await fetchCitiesByState(undefined);
    expect(result).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://brasilapi.com.br/api/ibge/municipios/v1/${undefined}?providers=gov`
    );
  });

  test("should return an empty array if the response is not an array", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: jest.fn().mockResolvedValue({ key: "value" }),
    });
    const result = await fetchCitiesByState(state);
    expect(result).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://brasilapi.com.br/api/ibge/municipios/v1/${state}?providers=gov`
    );
  });
});
