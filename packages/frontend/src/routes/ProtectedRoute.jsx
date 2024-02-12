import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ROUTES from '../constants/routes';
import { handleGetCurrentUser } from "../services/auth";
import { Header, AdminFooter } from "../components/layout";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState();

  const verifyUser = useCallback(async () => {
    try {
      const currentUser = await handleGetCurrentUser();
      if (currentUser) setUser(currentUser);
      else navigate(`/${ROUTES.AUTH.SIGNIN}`);
    } catch (error) {
      navigate(`/${ROUTES.AUTH.SIGNIN}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      <main className="flex flex-grow flex-col items-center justify-start pt-14 container m-auto">
        <Outlet />
      </main>
      <AdminFooter />
    </div>
  );
};

export default ProtectedRoute;
