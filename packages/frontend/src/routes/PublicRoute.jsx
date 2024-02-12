import { useCallback, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ROUTES from '../constants/routes';
import { handleGetCurrentUser } from "../services/auth";
import { Footer, Header } from "../components/layout";

const PublicRoute = () => {
  const navigate = useNavigate();

  const verifyUser = useCallback(async () => {
    try {
      const currentUser = await handleGetCurrentUser();
      if (currentUser) navigate(`/${ROUTES.ADMIN.DASHBOARD}`);
    } catch (error) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-grow flex-col items-center justify-start pt-14 container m-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicRoute;
