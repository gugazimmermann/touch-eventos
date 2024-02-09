import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import translation from "../../../constants/translations/pt-br/auth.json";
import ROUTES from "../../../constants/routes";
import * as auth from "../../../services/auth";
import SignUp from "./SignUp";

jest.mock("../../../services/auth", () => ({
  ...jest.requireActual("../../../services/auth"),
  handleSignUp: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("SignUp Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = (initialEntries = [`/${ROUTES.AUTH.SIGNUP}`]) => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={`/${ROUTES.AUTH.SIGNUP}`} element={<SignUp />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  test("renders the SignUp component", () => {
    setupComponent();
    expect(screen.getByTestId("auth-card-title")).toHaveTextContent(translation.signup);
  });

  test("submits the form and shows Email error alert", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-up-button"));
    await waitFor(() => expect(auth.handleSignUp).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_email));
  });

  test("submits the form and show Password error alert when password < 6", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-up-button"));
    await waitFor(() => expect(auth.handleSignUp).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_password));
  });

  test("submits the form and show Password error alert when password diff", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "1234567" },
    });
    fireEvent.click(screen.getByTestId("sign-up-button"));
    await waitFor(() => expect(auth.handleSignUp).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_password));
  });

  test("submits the form and error alert", async () => {
    auth.handleSignUp.mockRejectedValueOnce(new Error("Sign-up failed"));
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-up-button"));
    await waitFor(() => expect(auth.handleSignUp).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent("Sign-up failed"));
  });

  test("submits the form and userId is false", async () => {
    auth.handleSignUp.mockReturnValueOnce(false);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-up-button"));
    await waitFor(() => expect(auth.handleSignUp).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.form_error));
  });

  test("submits the form and redirects to confirm password on successful sign-up", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    auth.handleSignUp.mockReturnValueOnce(true);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.repeat_password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-up-button"));
    await waitFor(() => expect(auth.handleSignUp).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.AUTH.CONFIRMEMAIL}/test@test.com`));
  });
});
