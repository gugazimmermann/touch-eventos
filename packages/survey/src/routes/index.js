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

const Auth = lazyLoad(import("../pages/Auth"));
// const PersonalData = lazyLoad(import("../pages/PersonalData"));
// const ActivityData = lazyLoad(import("../pages/ActivityData"));
// const Finished = lazyLoad(import("../pages/Finished"));

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path={`/:activitySlug?`}
        element={<Auth />}
      />
      {/* <Route
        path={`/:activitySlug?/pessoal`}
        element={<PersonalData />}
      />
      <Route
         path={`/:activitySlug?/sobre-o-evento`}
        element={<ActivityData />}
      />
      <Route
         path={`/:activitySlug?/pesquisa-completa`}
        element={<Finished />}
      /> */}
    </>
  )
);

export default router;
