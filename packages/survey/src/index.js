import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { SurveyProvider } from "./context/SurveyContext";
import reportWebVitals from "./reportWebVitals";
import routes from "./routes";
import "./i18n";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SurveyProvider>
    <RouterProvider router={routes} />
  </SurveyProvider>
);

reportWebVitals();
