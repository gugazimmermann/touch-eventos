import fetchCoordinates from "./coords";

const mockSuccessResponse = [
  {
    lat: "12.34",
    lon: "56.78",
  },
];

describe("fetchCoordinates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return coordinates if the API request is successful", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockSuccessResponse),
    });
    const result = await fetchCoordinates("Street", "123", "City", "State");
    expect(result).toEqual({
      lat: "12.34",
      lon: "56.78",
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=Street, 123, City, State, BR&limit=1"
    );
  });

  test("should return null if the API response is empty", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue([]) });
    const result = await fetchCoordinates("Invalid", "456", "City", "State");
    expect(result).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=Invalid, 456, City, State, BR&limit=1"
    );
  });
});
