import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAfter, isBefore } from "date-fns";
import { event } from "../../services";
import { CloudUpload } from "../../icons";
import { maskCep } from "../../helpers/mask";
import { formatValue } from "../../helpers/format";
import { Toast } from "..";

const EventLogo = ({ logo, setError, onLogoChange }) => {
  const { t } = useTranslation("admin");
  const [isToastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef(null);
  const [displayLogo, setDisplayLogo] = useState(logo);

  const handleLogoClick = () => {
    fileInputRef.current.click();
  };

  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) return false;
    if (file.size > 2097152) return false;
    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setDisplayLogo(base64Image);

        onLogoChange(base64Image);
      };
      reader.readAsDataURL(file);
    } else {
      setToastVisible(true);
      setToastMessage(t("edit_event_card_img_error"));
    }
  };

  return (
    <div
      className="flex align-middle items-center justify-center w-16 h-16 border-2 rounded-full bg-white border-primary-500 cursor-pointer"
      onClick={handleLogoClick}
    >
      {displayLogo ? (
        <img
          className="w-16 h-16 object-cover rounded-full"
          alt="Event Logo"
          src={displayLogo}
        />
      ) : (
        <CloudUpload className="w-10 h-10" />
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/jpeg, image/png"
      />
      {isToastVisible && (
        <Toast
          message={toastMessage}
          isVisible={isToastVisible}
          onClose={() => setToastVisible(false)}
        />
      )}
    </div>
  );
};

const EventRow = ({ title, content }) => {
  return (
    <tr className="border-b ">
      <td className="whitespace-nowrap p-2">{title}</td>
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

const EventDetailsCard = ({
  data,
  setLoading,
  setError,
  setSuccess,
  setInfo,
}) => {
  const { t } = useTranslation("admin");

  const handleLogoChange = async (newLogo) => {
    if (newLogo) {
      const payload = {
        logo: newLogo,
        eventId: data.eventId,
        userId: data.userId,
      };
      const res = await event.saveEventImage(payload);
      console.log(res);
    }
  };

  return (
    <div className="w-full px-4 py-2 bg-white rounded-lg shadow-lg">
      <div className="flex -mt-8 justify-end">
        <EventLogo
          logo={data.logo}
          setError={setError}
          onLogoChange={handleLogoChange}
        />
      </div>
      <h2 className="-mt-6 text-xl text-strong">{data.name}</h2>
      <div className="inline-block min-w-full overflow-x-auto">
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm mt-2">
            <tbody>
              <EventRow
                title={t("edit_event_card_dates")}
                content={data.dates && data.dates.join(", ")}
              />
              <EventRow
                title={t("edit_event_card_plan")}
                content={`${data.plan.type} - ${
                  data.plan.duration
                } - ${formatValue(data.plan.price)}`}
              />
              <EventRow
                title={t("edit_event_card_verification_type")}
                content={`${data.verification.type} - ${
                  data.verification.description
                } ${
                  data.verification.price !== "0.00"
                    ? `- ${formatValue(data.verification.price)}`
                    : ""
                }`}
              />
              <EventRow
                title={t("edit_event_card_visitors_gift")}
                content={
                  data.visitorGift === "YES"
                    ? t("new_event_yes")
                    : t("new_event_no")
                }
              />
              <EventRow
                title={t("edit_event_card_raffle")}
                content={`${
                  data.raffle === "YES"
                    ? `${t("new_event_yes")}, `
                    : t("new_event_no")
                }${
                  data.raffleType === "SURVEY"
                    ? t("new_event_raffle_survey")
                    : t("new_event_raffle_all")
                }`}
              />
              <EventRow
                title={t("edit_event_card_address")}
                content={formatAddress(data)}
              />
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {showEditButton(data.startDate) && (
          <button
            type="button"
            className="px-2 py-1 text-sm tracking-wide text-white bg-primary-500 capitalize rounded-lg"
          >
            Editar
          </button>
        )}
        {showArchiveButton(data.endDate) && (
          <button
            type="button"
            className="px-2 py-1 text-sm tracking-wide text-white bg-secondary-500 capitalize rounded-lg"
          >
            Arquivar
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetailsCard;
