import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { account, auth } from "../../../services";
import { formatDate, formatValue } from "../../../helpers/format";
import { AdminTopNav } from "../../../components/layout";
import { Tab } from "../../../components/tab";
import { TableStatus } from "../../../components/table";
import AccountInfo from "./AccountInfo";
import AccountPassword from "./AccountPassword";
import Payments from "./Payments";

const Account = () => {
  const { t } = useTranslation("account");
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [accountInfo, setAccountInfo] = useState();
  const [payments, setPayments] = useState([]);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const handleTabClick = (i) => {
    setSelectedTab(i);
  };

  const fetchData = useCallback(async (reloadInfo) => {
      setLoading(true);
      try {
        const [userData, paymentsData] = await Promise.all([
          await account.getCurrentUser(),
          await account.getCurrentUserPayments(),
        ]);
        setAccountInfo(userData);
        setPayments(
          paymentsData.map((d) => ({
            date: formatDate(d.date),
            plan: d.plan,
            value: formatValue(d.value),
            status: (
              <TableStatus
                status={d.status}
                text={
                  d.status === "success"
                    ? t("payments_status_success")
                    : t("payments_status_failure")
                }
              />
            ),
          }))
        );
        const userEmail = await auth.handleFetchUserEmail();
        if (userEmail.emailVerified === "false") setConfirmEmail(true);
        else setConfirmEmail(false);
        setReload(reloadInfo);
      } catch (error) {
        alert(error);
      }
      setLoading(false);
    }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      compoment: <Payments data={payments} />,
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
      />
    </section>
  );
};

export default Account;
