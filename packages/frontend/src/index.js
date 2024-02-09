import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Amplify } from "aws-amplify";
import "./index.css";
import routes from "./routes";
import reportWebVitals from "./reportWebVitals";
import './i18n';

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
  <>
    <RouterProvider router={routes} />
  </>
);

reportWebVitals();
