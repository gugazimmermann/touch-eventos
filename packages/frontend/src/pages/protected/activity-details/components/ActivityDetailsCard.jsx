import { useTranslation } from "react-i18next";
import { isAfter, isBefore } from "date-fns";
import { maskCep } from "../../../../helpers/mask";
import { formatDate, formatValue } from "../../../../helpers/format";
import { Clipboard } from "../../../../icons";
import { Br, Es, Us } from "react-flags-select";

const ActivityRow = ({ title, content }) => {
  return (
    <tr className="border-b">
      <td className="whitespace-nowrap p-2 font-bold max-w-52">{title}</td>
      <td className="py-2">{content}</td>
    </tr>
  );
};

const formatAddress = (data) => {
  return ` ${data?.addressStreet}${
    data?.addressNumber && `, ${data.addressNumber}`
  }${data?.addressComplement && `, ${data.addressComplement}`}${
    data?.addressNeighborhood && `, ${data.addressNeighborhood}`
  }${data?.addressCity && `, ${data.addressCity}`}${
    data?.addressState && ` / ${data.addressState}`
  }${data?.addressZipCode && ` - ${maskCep(data.addressZipCode)}`}`.replace(
    /\s+/g,
    " "
  );
};

const showEditButton = (start) => {
  const startDate = new Date(parseInt(start, 10));
  const today = new Date();
  if (isAfter(startDate, today)) return true;
  return false;
};

const showArchiveButton = (end) => {
  const endDate = new Date(parseInt(end, 10));
  const today = new Date();
  if (isBefore(endDate, today)) return true;
  return false;
};

const ActivityDetailsCard = ({ data }) => {
  const { t } = useTranslation("activity_details");

  const showGiftText = (visitorGift) => {
    return visitorGift === "YES"
      ? t("activity_details_yes")
      : t("activity_details_no");
  };

  const showFaffleText = (raffle, raffleType) => {
    return raffle === "YES"
      ? `${t("activity_details_yes")} - ${
          raffleType === "SURVEY"
            ? t("activity_details_card_details_raffle_survey")
            : t("activity_details_card_details_raffle_all")
        }`
      : t("activity_details_no");
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg py-2">
      <div className="inline-block min-w-full overflow-x-auto">
        <div className="overflow-hidden">
          <table className="w-full text-left">
            <tbody>
              <ActivityRow
                title={t("activity_details_card_details_dates")}
                content={data.dates && data.dates.join(", ")}
              />
              <ActivityRow
                title={t("activity_details_card_details_address")}
                content={formatAddress(data)}
              />
              <ActivityRow
                title={t("activity_details_card_details_plan")}
                content={`${data.plan.type} - ${data.plan.duration}`}
              />
              <ActivityRow
                title={t("activity_details_card_details_verification_type")}
                content={`${data.verification.type} ${
                  data.verification.price !== "0.00"
                    ? `- ${formatValue(data.verification.price)} / ${t(
                        "activity_details_card_details_verification_type_sended"
                      )}`
                    : ""
                }`}
              />
              <ActivityRow
                title={t("activity_details_card_details_visitors_gift")}
                content={showGiftText(data.visitorGift)}
              />
              <tr className="border-b">
                <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                  {t("Data Final da Pesquisa")}
                </td>
                <td className="py-2">
                  {formatDate(data.surveyLastDay, { time: false })}
                </td>
              </tr>
              <ActivityRow
                title={t(
                  "activity_details_card_details_notifY_survey_on_confirm"
                )}
                content={showGiftText(data.notificationOnConfirm)}
              />
              <ActivityRow
                title={t("activity_details_card_details_notifY_survey_on_end")}
                content={showGiftText(data.notificationOnActivityEnd)}
              />
              <tr className="border-b">
                <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                  {t("URL da Pesquisa")}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${String(process.env.REACT_APP_SITE_SURVEY_URL)}/${
                          data.slug
                        }`
                      );
                    }}
                  >
                    <Clipboard />
                  </button>
                </td>
                <td className="py-2">
                  <a
                    href={`${String(process.env.REACT_APP_SITE_SURVEY_URL)}/${
                      data.slug
                    }`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {`${process.env.REACT_APP_SITE_SURVEY_URL}/${data.slug}`}
                  </a>
                </td>
              </tr>
              <ActivityRow
                title={t("activity_details_card_details_raffle")}
                content={showFaffleText(data.raffle, data.raffleType)}
              />
              {data.raffle === "YES" && (
                <>
                  <tr className="border-b">
                    <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                      {t("Sorteio Automático")}
                    </td>
                    <td className="py-2">
                      {data.raffleAutomatic ? "Sim" : "Não"}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                      {t("Dia do Sorteio")}
                    </td>
                    <td className="py-2">
                      {formatDate(data.raffleDay, { time: false })}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-row justify-between px-4 py-2">
        <div className="flex justify-end gap-4">
          {!data.payment && (
            <button
              type="button"
              className="px-4 py-1.5 text-sm tracking-wide text-white bg-success-500 capitalize rounded-lg"
            >
              {t("activity_details_card_details_button_payment")}
            </button>
          )}
        </div>
        <div className="flex justify-end gap-4">
          {showEditButton(data.startDate) && (
            <button
              type="button"
              className="px-4 py-1 text-sm tracking-wide text-white bg-primary-500 capitalize rounded-lg"
            >
              {t("activity_details_card_details_button_edit")}
            </button>
          )}
          {showArchiveButton(data.endDate) && (
            <button
              type="button"
              className="px-4 py-1 text-sm tracking-wide text-white bg-secondary-500 capitalize rounded-lg"
            >
              {t("activity_details_card_details_button_archive")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsCard;
