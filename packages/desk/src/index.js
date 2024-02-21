import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { DeskProvider } from "./context/DeskContext";
import reportWebVitals from "./reportWebVitals";
import routes from "./routes";
import "./i18n";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <DeskProvider>
    <RouterProvider router={routes} />
  </DeskProvider>
);

reportWebVitals();
