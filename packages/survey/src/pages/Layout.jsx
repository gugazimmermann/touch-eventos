import { Outlet } from "react-router-dom";
import { Header, FooterSmall } from "../components/layout";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex flex-grow flex-col items-center justify-start m-auto w-full mt-10">
        <Outlet />
      </main>
      <FooterSmall green={true} />
    </div>
  );
};

export default Layout;
