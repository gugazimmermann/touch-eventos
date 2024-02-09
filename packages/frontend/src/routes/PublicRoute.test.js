import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import translation from "../constants/translations/pt-br/auth.json";
import ROUTES from "../constants/routes";
import * as auth from "../services/auth";
import PublicRoute from "./PublicRoute";

jest.mock("../services/auth", () => ({
  ...jest.requireActual("../services/auth"),
  handleGetCurrentUser: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("PublicRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PublicRoute />
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  it("shows Access Admin if the user is not authenticated", async () => {
    auth.handleGetCurrentUser.mockImplementation(() => null);
    setupComponent();
    await screen.findByText(translation.access_admin);
  });

  it("redirects to admin if the user is authenticated", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    auth.handleGetCurrentUser.mockImplementation(() => ({
      username: "testUser",
      userId: "123",
    }));
    setupComponent();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(`/${ROUTES.ADMIN.DASHBOARD}`));
  });
});
