import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import translation from '../../constants/translations/pt-br/auth.json';
import * as auth from "../../services/auth";
import Nav from "./Nav";

jest.mock("../../services/auth", () => ({
  ...jest.requireActual("../../services/auth"),
  handleSignOut: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Nav", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
        <Nav user={{ username: "testUser", userId: "123" }} />
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  it("handleLogout should be called on button click", async () => {
    auth.handleSignOut.mockReturnValueOnce();
    const mockNavigate = jest.fn();
    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
    setupComponent();
    const logoutButton = screen.getByText(translation.logout);
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);
    await waitFor(async () => expect(auth.handleSignOut).toHaveBeenCalled());
    await waitFor(async () => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });
});
