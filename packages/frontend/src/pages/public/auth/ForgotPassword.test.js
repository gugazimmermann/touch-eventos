import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import translation from "../../../constants/translations/pt-br/auth.json";
import ROUTES from "../../../constants/routes";
import * as auth from "../../../services/auth";
import ForgotPassword from "./ForgotPassword";

jest.mock("../../../services/auth", () => ({
  ...jest.requireActual("../../../services/auth"),
  handleForgotPassword: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = (initialEntries = [`/${ROUTES.AUTH.FORGOTPASSWORD}`]) => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={`/${ROUTES.AUTH.FORGOTPASSWORD}`} element={<ForgotPassword />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  test("renders the ForgotPassword component", () => {
    setupComponent();
    expect(screen.getByTestId("auth-card-title")).toHaveTextContent(translation.forgot_password);
  });

  test("submits the form and shows Email error alert", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test" },
    });
    fireEvent.click(screen.getByTestId("forgot-password-button"));
    await waitFor(() => expect(auth.handleForgotPassword).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_email));
  });

  test("submits the form and error alert", async () => {
    auth.handleForgotPassword.mockRejectedValueOnce(new Error("Reset password failed"));
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByTestId("forgot-password-button"));
    await waitFor(() => expect(auth.handleForgotPassword).toHaveBeenCalledWith("test@test.com"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent("Reset password failed"));
  });

  test("submits the form and useremail is false", async () => {
    auth.handleForgotPassword.mockReturnValueOnce(false);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByTestId("forgot-password-button"));
    await waitFor(() => expect(auth.handleForgotPassword).toHaveBeenCalledWith("test@test.com"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.form_error));
  });

  test("submits the form and redirects to admin on successful forgot password", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    auth.handleForgotPassword.mockReturnValueOnce('t*@t*.com');
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByTestId("forgot-password-button"));
    await waitFor(() => expect(auth.handleForgotPassword).toHaveBeenCalledWith("test@test.com"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.AUTH.NEWPASSWORD}/test@test.com`));
  });
});
