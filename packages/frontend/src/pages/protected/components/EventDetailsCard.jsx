import { useTranslation } from "react-i18next";
import { isAfter, isBefore } from "date-fns";
import { maskCep } from "../../../helpers/mask";
import { formatValue } from "../../../helpers/format";
import { Clipboard } from "../../../icons";
import { Br, Es, Us } from "react-flags-select";

const EventRow = ({ title, content }) => {
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

const EventDetailsCard = ({ data }) => {
  const { t } = useTranslation("admin");

  const showGiftText = (visitorGift) => {
    return visitorGift === "YES" ? t("new_event_yes") : t("new_event_no");
  };

  const showFaffleText = (raffle, raffleType) => {
    return raffle === "YES"
      ? `${t("new_event_yes")} - ${
          raffleType === "SURVEY"
            ? t("new_event_raffle_survey")
            : t("new_event_raffle_all")
        }`
      : t("new_event_no");
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg py-2">
      <div className="inline-block min-w-full overflow-x-auto">
        <div className="overflow-hidden">
          <table className="w-full text-left">
            <tbody>
              <EventRow
                title={t("edit_event_card_dates")}
                content={data.dates && data.dates.join(", ")}
              />
              <EventRow
                title={t("edit_event_card_address")}
                content={formatAddress(data)}
              />
              <EventRow
                title={t("edit_event_card_plan")}
                content={`${data.plan.type} - ${data.plan.duration}`}
              />
              <EventRow
                title={t("edit_event_card_verification_type")}
                content={`${data.verification.type} ${
                  data.verification.price !== "0.00"
                    ? `- ${formatValue(data.verification.price)} / envio`
                    : ""
                }`}
              />
              <EventRow
                title={t("edit_event_card_visitors_gift")}
                content={showGiftText(data.visitorGift)}
              />
              {data.visitorGift === "YES" && (
                <>
                  <tr className="border-b">
                    <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                      {t("Descrição do Brinde")} <Br className="w-5 h-5" />
                    </td>
                    <td className="py-2">{data.visitorGiftTextPTBR}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                      {t("Descrição do Brinde")} <Us className="w-5 h-5" />
                    </td>
                    <td className="py-2">{data.visitorGiftTextPTBR}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                      {t("Descrição do Brinde")} <Es className="w-5 h-5" />
                    </td>
                    <td className="py-2">{data.visitorGiftTextPTBR}</td>
                  </tr>
                </>
              )}
              <EventRow
                title={t("edit_event_card_raffle")}
                content={showFaffleText(data.raffle, data.raffleType)}
              />
              {data.raffle === "YES" && (
                <>
                <tr className="border-b">
                  <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                    {t("Descrição do Sorteio")} <Br className="w-5 h-5" />
                  </td>
                  <td className="py-2">{data.raffleTextPTBR}</td>
                </tr>
                <tr className="border-b">
                  <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                    {t("Descrição do Sorteio")} <Us className="w-5 h-5" />
                  </td>
                  <td className="py-2">{data.raffleTextEN}</td>
                </tr>
                <tr className="border-b">
                  <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                    {t("Descrição do Sorteio")} <Es className="w-5 h-5" />
                  </td>
                  <td className="py-2">{data.raffleTextES}</td>
                </tr>
              </>
              )}
              <EventRow
                title={t("Notificar Pesquisa na confirmação")}
                content={showGiftText(data.notificationOnConfirm)}
              />
              <EventRow
                title={t("Notificar pesquisa ao final do evento")}
                content={showGiftText(data.notificationOnEventEnd)}
              />
              <tr className="border-b">
                <td className="whitespace-nowrap p-2 font-bold flex items-center gap-2">
                  {t("URL Amigável")}
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
                <td className="py-2">{`${process.env.REACT_APP_SITE_SURVEY_URL}/${data.slug}`}</td>
              </tr>
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
              Pagamento
            </button>
          )}
        </div>
        <div className="flex justify-end gap-4">
          {showEditButton(data.startDate) && (
            <button
              type="button"
              className="px-4 py-1 text-sm tracking-wide text-white bg-primary-500 capitalize rounded-lg"
            >
              Editar
            </button>
          )}
          {showArchiveButton(data.endDate) && (
            <button
              type="button"
              className="px-4 py-1 text-sm tracking-wide text-white bg-secondary-500 capitalize rounded-lg"
            >
              Arquivar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsCard;
