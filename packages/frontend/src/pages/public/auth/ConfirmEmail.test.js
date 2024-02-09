import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import translation from "../../../constants/translations/pt-br/auth.json";
import ROUTES from "../../../constants/routes";
import * as auth from "../../../services/auth";
import ConfirmEmail from "./ConfirmEmail";

jest.mock("../../../services/auth", () => ({
  ...jest.requireActual("../../../services/auth"),
  handleConfirmEmail: jest.fn(),
  handleResendSignUpCode: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("ConfirmEmail Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = (initialEntries = [`/${ROUTES.AUTH.CONFIRMEMAIL}`]) => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={`/${ROUTES.AUTH.CONFIRMEMAIL}/:useremail?`} element={<ConfirmEmail />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  test("renders the ConfirmEmail component", () => {
    setupComponent();
    expect(screen.getByTestId("auth-card-title")).toHaveTextContent(translation.confirm_email);
  });

  test("sets email value from params", async () => {
    setupComponent([`/${ROUTES.AUTH.CONFIRMEMAIL}/test@test.com`]);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(translation.email).value).toBe("test@test.com");
    });
  });

  test("re send code and shows Email error alert", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test" },
    });
    fireEvent.click(screen.getByTestId("resend-code-button"));
    await waitFor(() => expect(auth.handleResendSignUpCode).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_email));
  });

  test("re send code and error alert", async () => {
    auth.handleResendSignUpCode.mockRejectedValueOnce(new Error("Resend sign-up code failed"));
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByTestId("resend-code-button"));
    await waitFor(() => expect(auth.handleResendSignUpCode).toHaveBeenCalledWith("test@test.com"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent("Resend sign-up code failed"));
  });

  test("re send code and destination is false", async () => {
    auth.handleResendSignUpCode.mockReturnValueOnce(false);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByTestId("resend-code-button"));
    await waitFor(() => expect(auth.handleResendSignUpCode).toHaveBeenCalledWith("test@test.com"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.form_error));
  });

  test("re send code success", async () => {
    auth.handleResendSignUpCode.mockReturnValueOnce(true);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByTestId("resend-code-button"));
    await waitFor(() => expect(auth.handleResendSignUpCode).toHaveBeenCalledWith("test@test.com"));
  });

  test("submits the form and shows Email error alert", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("confirm-email-button"));
    await waitFor(() => expect(auth.handleConfirmEmail).not.toHaveBeenCalled());
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
    fireEvent.click(screen.getByTestId("confirm-email-button"));
    await waitFor(() => expect(auth.handleConfirmEmail).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_code));
  });

  test("submits the form and error alert", async () => {
    auth.handleConfirmEmail.mockRejectedValueOnce(new Error("Confirm email failed"));
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("confirm-email-button"));
    await waitFor(() => expect(auth.handleConfirmEmail).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent("Confirm email failed"));
  });

  test("submits the form and isSignUpComplete is false", async () => {
    auth.handleConfirmEmail.mockReturnValueOnce(false);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("confirm-email-button"));
    await waitFor(() => expect(auth.handleConfirmEmail).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.form_error));
  });

  test("submits the form and redirects to admin on successful confirm email", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    auth.handleConfirmEmail.mockReturnValueOnce(true);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.code), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("confirm-email-button"));
    await waitFor(() => expect(auth.handleConfirmEmail).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.AUTH.SIGNIN}/test@test.com`));
  });
});
