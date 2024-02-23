import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { account, auth } from "../../../services";
import { AdminTopNav } from "../../../components/layout";
import { Tab } from "../../../components/tab";
import AccountInfo from "./AccountInfo";
import AccountPassword from "./AccountPassword";
import AccountPayments from "./AccountPayments";
import ROUTES from "../../../constants/routes";

const Account = ({ initialTab }) => {
  const { t } = useTranslation("account");
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(false);
  const [accountInfo, setAccountInfo] = useState();
  const [confirmEmail, setConfirmEmail] = useState(false);

  const handleTabClick = (i) => {
    if (i === 1)
      navigate(`/${ROUTES.ADMIN.ACCOUNTPASSWORD}`, { replace: true });
    else if (i === 2)
      navigate(`/${ROUTES.ADMIN.ACCOUNTPAYMENT}`, { replace: true });
    else navigate(`/${ROUTES.ADMIN.ACCOUNTPROFILE}`, { replace: true });
  };

  const fetchData = useCallback(async (reloadInfo) => {
    setLoading(true);
    try {
      const userData = await account.getCurrentUser();
      setAccountInfo(userData);
      const userEmail = await auth.handleFetchUserEmail();
      if (userEmail.emailVerified === "false") setConfirmEmail(true);
      else setConfirmEmail(false);
      setReload(reloadInfo);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    if (initialTab === "password") setSelectedTab(1);
    else if (initialTab === "payments") setSelectedTab(2);
    else setSelectedTab(0);
  }, [fetchData, initialTab]);

  const tabs = [
    {
      title: t("account_info"),
      compoment: (
        <AccountInfo
          data={accountInfo}
          fetchData={fetchData}
          reload={reload}
          confirmEmail={confirmEmail}
        />
      ),
    },
    {
      title: t("account_password_new_password"),
      compoment: <AccountPassword confirmEmail={confirmEmail} />,
    },
    {
      title: t("payments"),
      compoment: <AccountPayments />,
    },
  ];

  return (
    <section className="w-full px-4">
      <AdminTopNav title={t("account")} />
      <Tab
        tabs={tabs}
        selectedTab={selectedTab}
        onTabClick={handleTabClick}
        loading={loading}
        error={error}
      />
    </section>
  );
};

export default Account;
