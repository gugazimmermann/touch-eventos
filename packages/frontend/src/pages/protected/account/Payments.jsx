import { useTranslation } from "react-i18next";
import { Table } from "../../../components/table";
import { Title } from "../../../components";

const Payments = ({ data = [] }) => {
  const { t } = useTranslation("account");

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

  return (
    <>
      <Title title={t("payments")} count={data.length} />
      <Table header={header} items={data} perPage={10} />
    </>
  );
};

export default Payments;
