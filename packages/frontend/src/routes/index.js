import React, { lazy, Suspense } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import ROUTES from "../constants/routes";
import SiteLayout from "../pages/public/site-layout/SiteLayout";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import { Loading } from "../components";
import Home from "../pages/public/home/Home";

const lazyLoad = (component) => {
  const LazyComponent = lazy(() => component);
  return (props) => (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

const Company = lazyLoad(import("../pages/public/company/Company"));
const WorkWithUs = lazyLoad(import("../pages/public/work-with-us/WorkWithUs"));
const Faq = lazyLoad(import("../pages/public/faq/Faq"));
const ContactUs = lazyLoad(import("../pages/public/contact-us/ContactUs"));
const UsageTerms = lazyLoad(import("../pages/public/usage-terms/UsageTerms"));
const PrivacityTerms = lazyLoad(
  import("../pages/public/privacity-terms/PrivacityTerms")
);
const SignIn = lazyLoad(import("../pages/public/auth/SignIn"));
const SignUp = lazyLoad(import("../pages/public/auth/SignUp"));
const ConfirmEmail = lazyLoad(import("../pages/public/auth/ConfirmEmail"));
const ForgotPassword = lazyLoad(import("../pages/public/auth/ForgotPassword"));
const NewPassword = lazyLoad(import("../pages/public/auth/NewPassword"));

const Admin = lazyLoad(import("../pages/protected/Admin"));
const Account = lazyLoad(import("../pages/protected/account/Account"));
const NewActivity = lazyLoad(
  import("../pages/protected/new-activity/NewActivity")
);
const ActivityDetails = lazyLoad(
  import("../pages/protected/activity-details/ActivityDetails")
);
const ActivityDetailsRegisters = lazyLoad(
  import("../pages/protected/activity-details/ActivityDetailsRegisters")
);
const ActivityDetailsDesk = lazyLoad(
  import("../pages/protected/activity-details/ActivityDetailsDesk")
);
const ActivityDetailsSurvey = lazyLoad(
  import("../pages/protected/activity-details/ActivityDetailsSurvey")
);
const ActivityDetailsDefaultSurvey = lazyLoad(
  import("../pages/protected/activity-details/ActivityDetailsDefaultSurvey")
);
const ActivityDetailsSurveyAnswers = lazyLoad(
  import("../pages/protected/activity-details/ActivityDetailsSurveyAnswers")
);

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path={`/${ROUTES.WEBSITE.COMPANY}`} element={<Company />} />
        <Route
          path={`/${ROUTES.WEBSITE.WORK_WITH_US}`}
          element={<WorkWithUs />}
        />
        <Route path={`/${ROUTES.WEBSITE.FAQ}`} element={<Faq />} />
        <Route path={`/${ROUTES.WEBSITE.CONTACT}`} element={<ContactUs />} />
        <Route
          path={`/${ROUTES.WEBSITE.USAGE_TERMS}`}
          element={<UsageTerms />}
        />
        <Route
          path={`/${ROUTES.WEBSITE.PRIVACITY_TERMS}`}
          element={<PrivacityTerms />}
        />
      </Route>
      <Route element={<PublicRoute />}>
        <Route
          path={`/${ROUTES.AUTH.SIGNIN}/:useremail?`}
          element={<SignIn />}
        />
        <Route path={`/${ROUTES.AUTH.SIGNUP}`} element={<SignUp />} />
        <Route
          path={`/${ROUTES.AUTH.CONFIRMEMAIL}/:useremail?`}
          element={<ConfirmEmail />}
        />
        <Route
          path={`/${ROUTES.AUTH.FORGOTPASSWORD}`}
          element={<ForgotPassword />}
        />
        <Route
          path={`/${ROUTES.AUTH.NEWPASSWORD}/:useremail?`}
          element={<NewPassword />}
        />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path={`/${ROUTES.ADMIN.DASHBOARD}`} element={<Admin />} />
        <Route path={`/${ROUTES.ADMIN.ACCOUNT}`} element={<Account />} />
        <Route path={`/${ROUTES.ADMIN.ACCOUNTPROFILE}`} element={<Account />} />
        <Route
          path={`/${ROUTES.ADMIN.ACCOUNTPASSWORD}`}
          element={<Account initialTab="password" />}
        />
        <Route
          path={`/${ROUTES.ADMIN.ACCOUNTPAYMENT}`}
          element={<Account initialTab="payments" />}
        />
        <Route
          path={`/${ROUTES.ADMIN.NEWACTIVITY}`}
          element={<NewActivity />}
        />
        <Route
          path={`/${ROUTES.ADMIN.ACTIVITY}/:activityId`}
          element={<ActivityDetails />}
        />
        <Route
          path={`/${ROUTES.ADMIN.ACTIVITY}/:activityId/${ROUTES.ADMIN.REGISTERS}`}
          element={<ActivityDetailsRegisters />}
        />
        <Route
          path={`/${ROUTES.ADMIN.ACTIVITY}/:activityId/${ROUTES.ADMIN.DESK}`}
          element={<ActivityDetailsDesk />}
        />
        <Route
          path={`/${ROUTES.ADMIN.ACTIVITY}/:activityId/${ROUTES.ADMIN.SURVEYS}/:lang?`}
          element={<ActivityDetailsSurvey />}
        />
        <Route
          path={`/${ROUTES.ADMIN.ACTIVITY}/:activityId/${ROUTES.ADMIN.DEFAULT_SURVEYS}`}
          element={<ActivityDetailsDefaultSurvey />}
        />
        <Route
          path={`/${ROUTES.ADMIN.ACTIVITY}/:activityId/${ROUTES.ADMIN.ANSWERS}`}
          element={<ActivityDetailsSurveyAnswers />}
        />
      </Route>
    </>
  )
);

export default router;
