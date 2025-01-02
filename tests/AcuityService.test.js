import AcuityScheduling from "../src/AcuityScheduling";
import AcuityService from "../src/AcuityService";

describe("AcuityService basic method", () => {
  it("should create AcuityScheduling instance with provided config", () => {
    // Arrange
    const mockConfig = {
      base: "https://test.acuityscheduling.com",
      apiKey: "test-api-key",
      userId: "12345",
    };

    // Act
    const result = AcuityService.basic(mockConfig);

    // Assert
    expect(result).toBeInstanceOf(AcuityScheduling);
    expect(result.base).toBe(mockConfig.base);
    expect(result.apiKey).toBe(mockConfig.apiKey);
    expect(result.userId).toBe(mockConfig.userId);
  });

  it("should create AcuityScheduling instance with empty config", () => {
    // Act
    const result = AcuityService.basic();

    // Assert
    expect(result).toBeInstanceOf(AcuityScheduling);
  });
});
