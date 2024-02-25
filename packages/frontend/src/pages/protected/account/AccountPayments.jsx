import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {useActivities} from '../../../context/ActivitiesContext';
import { account, stripe } from "../../../services";
import { formatDate, formatValue } from "../../../helpers/format";
import { Table, TableStatus } from "../../../components/table";
import { Alert, Loading, Title } from "../../../components";

const AccountPayments = () => {
  const { t } = useTranslation("account");
  const {state} = useActivities();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [cards, setCards] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsData, cardsData] = await Promise.all([
        await account.getCurrentUserPayments(),
        await stripe.customerPaymentMethods(),
      ]);
      setPayments(
        paymentsData.map((d) => ({
          date: formatDate(d.date, {
            timezone: state.addressTimezone
          }),
          plan: d.plan,
          value: formatValue(d.value, {
            timezone: state.addressTimezone
          }),
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
      setCards(
        cardsData.paymentMethods.map((c) => ({
          date: formatDate(c.created, {
            timezone: state.addressTimezone
          }),
          brand: c.brand.toLocaleUpperCase(),
          expiration: c.expiration,
          last4: c.last4,
        }))
      );
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  }, [state.addressTimezone, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const header = [
    {
      title: t("payments_date"),
    },
    {
      title: t("payments_plan"),
    },
    {
      title: t("payments_value"),
    },
    {
      title: t("payments_status"),
    },
  ];

  const cardHeader = [
    {
      title: t("payments_card_date"),
    },
    {
      title: t("payments_card_brand"),
    },
    {
      title: t("payments_card_expiration"),
    },
    {
      title: t("payments_card_last4"),
    },
  ];

  return (
    <>
      {error && <Alert message={error} type="danger" />}
      {loading ? (
        <Loading />
      ) : (
        <>
          <Title title={t("payments")} count={payments.length} />
          <Table header={header} items={payments} perPage={10} />
          <div className="mt-4">
            <Title title={t("payments_card_title")} count={cards.length} />
            <Table header={cardHeader} items={cards} perPage={10} />
          </div>
        </>
      )}
    </>
  );
};

export default AccountPayments;
