import { render, screen } from "@testing-library/react";
import Alert from "./Alert";

describe("Alert Component", () => {
  test("renders correctly with all props", () => {
    const props = {
      type: "success",
      title: "Success Alert",
      message: "This is a success message.",
    };
    render(<Alert {...props} />);
    const alertElement = screen.getByTestId("alert");
    expect(alertElement).toHaveClass(
      "bg-success-100 border-success-400 text-success-700"
    );
    expect(screen.getByText("Success Alert")).toBeInTheDocument();
    expect(screen.getByText("This is a success message.")).toBeInTheDocument();
  });

  test("renders info correctly without title", () => {
    const props = {
      type: "info",
      message: "This is an info message.",
    };
    render(<Alert {...props} />);
    const alertElement = screen.getByTestId("alert");
    expect(alertElement).toHaveClass("bg-info-100 border-info-400 text-info-700");
    expect(screen.getByText("This is an info message.")).toBeInTheDocument();
  });

  test("renders warning correctly", () => {
    const props = {
      type: "warning",
      title: "Warning Alert",
      message: "This is a warning message.",
    };
    render(<Alert {...props} />);
    const alertElement = screen.getByTestId("alert");
    expect(alertElement).toHaveClass(
      "bg-warning-100 border-warning-400 text-warning-700"
    );
    expect(screen.getByText("Warning Alert")).toBeInTheDocument();
    expect(screen.getByText("This is a warning message.")).toBeInTheDocument();
  });

  test("renders danger correctly", () => {
    const props = {
      type: "danger",
      title: "Danger Alert",
      message: "This is a danger message.",
    };
    render(<Alert {...props} />);
    const alertElement = screen.getByTestId("alert");
    expect(alertElement).toHaveClass(
      "bg-danger-100 border-danger-400 text-danger-700"
    );
    expect(screen.getByText("Danger Alert")).toBeInTheDocument();
    expect(screen.getByText("This is a danger message.")).toBeInTheDocument();
  });

  test("renders correctly with default styles for unknown type", () => {
    const props = {
      type: "unknownType",
      message: "This is a message with an unknown type.",
    };
    render(<Alert {...props} />);
    const alertElement = screen.getByTestId("alert");
    expect(alertElement).toHaveClass(
      "bg-success-100 border-success-400 text-success-700"
    );
    expect(
      screen.getByText("This is a message with an unknown type.")
    ).toBeInTheDocument();
  });
});
