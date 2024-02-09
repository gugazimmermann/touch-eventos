import { Link } from "react-router-dom";
import Logo from "./Logo";
import Nav from "./Nav";

const Header = ({ user }) => {
  return (
    <header className=" p-2 bg-white fixed w-full shadow-md top-0 left-0 right-0 z-40">
      <div className="container mx-auto flex flex-wrap items-center">
        <div className="flex justify-start w-1/2">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <Nav user={user} />
      </div>
    </header>
  );
};

export default Header;
