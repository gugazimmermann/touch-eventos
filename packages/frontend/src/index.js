import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import { Amplify } from "aws-amplify";
import { ActivitiesProvider } from "./context/ActivitiesContext";
import routes from "./routes";
import "./i18n";
import "./index.css";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ActivitiesProvider>
    <RouterProvider router={routes} />
  </ActivitiesProvider>
);

reportWebVitals();
