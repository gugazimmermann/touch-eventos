import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useActivities } from "../../context/ActivitiesContext";
import ROUTES from "../../constants/routes";
import { handleSignOut } from "../../services/auth";

const Nav = () => {
  const { state, dispatch } = useActivities();
  const { t } = useTranslation(["layout"]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await handleSignOut();
    dispatch({
      type: "USER",
      payload: { user: null },
    });
    navigate("/");
  };

  return (
    <nav className="flex content-center justify-end w-full">
      <div className="flex flex-none justify-between items-center">
        {!state.user ? (
          <Link to={`/${ROUTES.AUTH.SIGNIN}`} className="hover:underline">
            {t("header_access_admin")}
          </Link>
        ) : (
          <>
            <Link to={`/${ROUTES.ADMIN.DASHBOARD}`} className="hover:underline">
              {t("header_dashboard")}
            </Link>
            <span className="mx-5">/</span>
            <Link to={`/${ROUTES.ADMIN.ACCOUNT}`} className="hover:underline">
              {t("header_account")}
            </Link>
            <span className="mx-5">/</span>
            <button
              type="button"
              className="hover:underline"
              onClick={() => handleLogout()}
            >
              {t("header_logout")}
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
