import { useTranslation } from "react-i18next";
import { Title } from "../../../components/page";
import { Table } from "../../../components/shared/table";

const Payments = ({ data = [] }) => {
  const { t } = useTranslation("admin");

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
      <Table header={header} items={data} />
    </>
  );
};

export default Payments;
