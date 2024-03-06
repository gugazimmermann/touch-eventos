import { Link } from "react-router-dom";
import Logo from "./Logo";
import Social from "./Social";

const FooterSmall = () => {
  return (
    <footer className="bg-success-500 text-white w-full">
      <div className="container py-2 mx-auto flex flex-row justify-between">
        <Link to="/">
          <Logo white={true} />
        </Link>
        <Social />
      </div>
    </footer>
  );
};

export default FooterSmall;
