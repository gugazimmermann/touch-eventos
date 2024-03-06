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

const Layout = lazyLoad(import("../pages/Layout"));
const Auth = lazyLoad(import("../pages/Auth"));
const Confirm = lazyLoad(import("../pages/Confirm"));
const DefaultSurvey = lazyLoad(import("../pages/DefaultSurvey"));
const ActivitySurvey = lazyLoad(import("../pages/ActivitySurvey"));
const FinalSurvey = lazyLoad(import("../pages/FinalSurvey"));

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path={`/:activitySlug?`} element={<Auth />} />
      <Route
        path={`/:activitySlug?/:registrationId?/:language?`}
        element={<Confirm />}
      />
      <Route
        path={`/:activitySlug?/:registrationId?/1/:language?`}
        element={<DefaultSurvey />}
      />
      <Route
        path={`/:activitySlug?/:registrationId?/2/:language?`}
        element={<ActivitySurvey />}
      />
      <Route
        path={`/:activitySlug?/:registrationId?/3/:language?`}
        element={<FinalSurvey />}
      />
    </Route>
  )
);

export default router;
