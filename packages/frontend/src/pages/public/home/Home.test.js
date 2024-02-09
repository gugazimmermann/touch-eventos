import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import translation from "../../../constants/translations/pt-br/webpage.json";
import Initial from "./Initial";

describe("Initial", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupComponent = () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <Initial />
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  it("shows welcome", async () => {
    setupComponent();
    await screen.findByText(translation.welcome);
  });
});
