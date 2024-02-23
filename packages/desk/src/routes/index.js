import React, { lazy, Suspense } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { Loading } from "../components";
import Layout from "../pages/layout/Layout";

const lazyLoad = (component) => {
  const LazyComponent = lazy(() => component);
  return (props) => (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

const Login = lazyLoad(import("../pages/auth/Login"));
const Gift = lazyLoad(import("../pages/gift/Gift"));

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<Layout />}>
        <Route path={`/:activitySlug?`} element={<Login />} />
        <Route path={`/:activitySlug/main`} element={<Gift />} />
      </Route>
    </>
  )
);

export default router;
