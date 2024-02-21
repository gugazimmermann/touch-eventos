import { Link } from "react-router-dom";
import Logo from "./Logo";

const FooterSmall = () => {
  return (
    <footer className="bg-success-500 text-white w-full">
      <div className="container p-4 mx-auto">
        <div className="pb-4 flex flex-col items-center">
          <Link to="/">
            <Logo white={true} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterSmall;
