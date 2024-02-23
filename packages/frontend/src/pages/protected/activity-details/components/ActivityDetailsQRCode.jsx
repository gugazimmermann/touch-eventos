import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";

const ActivityDetailsQRCode = ({ activityId }) => {
  const { t } = useTranslation("activity_details");
  const qrCodeRef = useRef(null);

  const downloadQRCode = useCallback(() => {
    const svgElement = qrCodeRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    canvas.width = 4096;
    canvas.height = 4096;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageUri = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qrcode-${activityId}.png`;
      link.href = imageUri;
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }, [activityId]);

  return (
    <div className="w-1/3 flex flex-col justify-between items-center bg-white rounded-lg shadow-lg">
      <h2 className="w-full py-2 text-xl text-strong text-center">
        {t("activity_details_card_qr_code_title")}
      </h2>
      <div
        ref={qrCodeRef}
        className="min-w-full flex justify-center items-center"
      >
        <QRCodeSVG
          value={`${process.env.REACT_APP_SITE_REGISTRATION_URL}/${activityId}`}
          size={4096}
          className="w-52 h-52"
        />
      </div>
      <div className="w-full flex flex-row justify-between px-4 py-2">
        <div className="w-full flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-1.5 text-sm tracking-wide text-white bg-secondary-500 capitalize rounded-lg"
            onClick={downloadQRCode}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsQRCode;