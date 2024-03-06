import { Link } from "react-router-dom";
import { useSurvey } from "../../context/SurveyContext";
import Logo from "./Logo";
import { Logout } from "../../icons";

const Header = () => {
  const { state, dispatch } = useSurvey();

  const handleLogout = () => {
    dispatch({
      type: "TOKEN",
      payload: { token: null },
    });
    dispatch({
      type: "REGISTRATIONID",
      payload: { registrationID: null },
    });
    dispatch({
      type: "ACTIVITY",
      payload: { activity: null },
    });
    dispatch({
      type: "REGISTRATION",
      payload: { registration: null },
    });
  };

  return (
    <header className=" p-2 bg-white fixed w-full shadow-md top-0 left-0 right-0 z-40">
      <div className="container mx-auto flex flex-wrap items-center">
        <div className="flex justify-start w-1/2">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="flex justify-end w-1/2">
          {state.token && (
            <button type="button" onClick={() => handleLogout()}>
              <Logout />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
