import React, { lazy, Suspense } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { Loading } from "../components";

const lazyLoad = (component) => {
  const LazyComponent = lazy(() => component);
  return (props) => (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

const Register = lazyLoad(import("../pages/Register"));
const Confirm = lazyLoad(import("../pages/Confirm"));
const ConfirmSuccess = lazyLoad(import("../pages/ConfirmSuccess"));

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path={`/:eventSlug?`}
        element={<Register />}
      />
      <Route
        path={`/:eventSlug?/:registrationId?/:language?`}
        element={<Confirm />}
      />
      <Route
        path={`/:eventSlug?/:registrationId?/:success?/:language?`}
        element={<ConfirmSuccess />}
      />
    </>
  )
);

export default router;
