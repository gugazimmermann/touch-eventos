import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import translation from "../../../constants/translations/pt-br/auth.json";
import ROUTES from "../../../constants/routes";
import * as auth from "../../../services/auth";
import SignIn from "./SignIn";

jest.mock("../../../services/auth", () => ({
  ...jest.requireActual("../../../services/auth"),
  handleSignIn: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("SignIn Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = (initialEntries = [`/${ROUTES.AUTH.SIGNIN}`]) => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={`/${ROUTES.AUTH.SIGNIN}/:useremail?`} element={<SignIn />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  test("renders the SignIn component", () => {
    setupComponent();
    expect(screen.getByTestId("auth-card-title")).toHaveTextContent(translation.signin);
  });

  test("sets email value from params", async () => {
    setupComponent([`/${ROUTES.AUTH.SIGNIN}/test@test.com`]);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(translation.email).value).toBe("test@test.com");
    });
  });

  test("submits the form and shows Email error alert", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-in-button"));
    await waitFor(() => expect(auth.handleSignIn).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_email));
  });

  test("submits the form and show Password error alert", async () => {
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "12345" },
    });
    fireEvent.click(screen.getByTestId("sign-in-button"));
    await waitFor(() => expect(auth.handleSignIn).not.toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.invalid_password));
  });

  test("submits the form and error alert", async () => {
    auth.handleSignIn.mockRejectedValueOnce(new Error("Sign-in failed"));
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-in-button"));
    await waitFor(() => expect(auth.handleSignIn).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent("Sign-in failed"));
  });

  test("submits the form and isSignedIn is false", async () => {
    auth.handleSignIn.mockReturnValueOnce(false);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-in-button"));
    await waitFor(() => expect(auth.handleSignIn).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(screen.getByTestId("alert")).toHaveTextContent(translation.form_error));
  });

  test("submits the form and redirects to admin on successful sign-in", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    auth.handleSignIn.mockReturnValueOnce(true);
    setupComponent();
    fireEvent.change(screen.getByPlaceholderText(translation.email), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(translation.password), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByTestId("sign-in-button"));
    await waitFor(() => expect(auth.handleSignIn).toHaveBeenCalledWith("test@test.com", "123456"));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.ADMIN.DASHBOARD}`));
  });
});
