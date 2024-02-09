import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import translation from "../../../constants/translations/pt-br/auth.json";
import ROUTES from "../../../constants/routes";
import * as auth from "../../../services/auth";
import NewPassword from "./NewPassword";

jest.mock("../../../services/auth", () => ({
  ...jest.requireActual("../../../services/auth"),
  handleNewPassword: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("NewPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = (initialEntries = [`/${ROUTES.AUTH.NEWPASSWORD}`]) => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={`/${ROUTES.AUTH.NEWPASSWORD}/:useremail?`} element={<NewPassword />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  test("renders the NewPassword component", () => {
    setupComponent();
    expect(screen.getByTestId("auth-card-title")).toHaveTextContent(translation.new_password);
  });

  test("sets email value from params", async () => {
    setupComponent([`/${ROUTES.AUTH.NEWPASSWORD}/test@test.com`]);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(translation.email).value).toBe("test@test.com");
    });
  });

  test("submits the form and shows Email error alert", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("new-password-button"));
    await waitFor(() => expect(auth.handleNewPassword).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_email));
  });

  test("submits the form and show Code error alert", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("new-password-button"));
    await waitFor(() => expect(auth.handleNewPassword).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_code));
  });

  test("submits the form and show Password error alert when password < 6", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("new-password-button"));
    await waitFor(() => expect(auth.handleNewPassword).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_password));
  });

  test("submits the form and show Password error alert when password is diff", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "1234567" },
    });
    fireEvent.click(screen.getByTestId("new-password-button"));
    await waitFor(() => expect(auth.handleNewPassword).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_password));
  });

  test("submits the form and error alert", async () => {
    auth.handleNewPassword.mockRejectedValueOnce(new Error("Confirm reset password failed"));
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("new-password-button"));
    await waitFor(() => expect(auth.handleNewPassword).toHaveBeenCalledWith("test@test.com", "123456", "123456"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent("Confirm reset password failed"));
  });

  test("submits the form and redirects to sign in on successful new password", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    auth.handleNewPassword.mockReturnValueOnce();
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("new-password-button"));
    await waitFor(() => expect(auth.handleNewPassword).toHaveBeenCalledWith("test@test.com", "123456", "123456"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.AUTH.SIGNIN}/test@test.com`));
  });
});
