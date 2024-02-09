import { Outlet, useLocation } from "react-router-dom";
import { Footer, Header } from "../../shared/components/layout";

const SiteLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex flex-grow flex-col items-center justify-start m-auto w-full mt-10">
        <Outlet />
      </main>
      <Footer green={location.pathname === "/"} />
    </div>
  );
};

export default SiteLayout;
