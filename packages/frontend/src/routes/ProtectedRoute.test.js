import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import translation from "../constants/translations/pt-br/auth.json";
import ROUTES from "../constants/routes";
import * as auth from "../services/auth";
import ProtectedRoute from "./ProtectedRoute";

jest.mock("../services/auth", () => ({
  ...jest.requireActual("../services/auth"),
  handleGetCurrentUser: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ProtectedRoute />
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  it("shows Logout if user is authenticated", async () => {
    auth.handleGetCurrentUser.mockImplementation(() => ({
      username: "testUser",
      userId: "123",
    }));
    setupComponent();
    await screen.findByText(translation.logout);
  });

  it("redirects to sign in if the user is not authenticated", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    auth.handleGetCurrentUser.mockImplementation(() => null);
    setupComponent();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.AUTH.SIGNIN}`));
  });

  it("redirects to sign in if handleGetCurrentUser return error", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    auth.handleGetCurrentUser.mockImplementation(() => {
      throw new Error("Fetch current user failed")
    });
    setupComponent();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.AUTH.SIGNIN}`));
  });
});
