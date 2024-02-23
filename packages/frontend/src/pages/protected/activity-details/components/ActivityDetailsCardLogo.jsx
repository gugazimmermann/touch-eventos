import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CloudUpload } from "../../../../icons";

const ActivityDetailsCardLogo = ({
  name,
  logo,
  onLogoChange,
  setToastVisible,
  setToastMessage,
}) => {
  const { t } = useTranslation("activity_details");
  const fileInputRef = useRef(null);
  const [displayLogo, setDisplayLogo] = useState(logo);

  const handleLogoClick = () => fileInputRef.current.click();

  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) return false;
    if (file.size > 2097152) return false;
    return true;
  };

  const handleFileChange = (activity) => {
    const file = activity.target.files[0];
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
      setToastMessage(t("activity_details_card_logo_img_error"));
    }
  };

  return (
    <div className="w-1/3 max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
      <div
        className="w-full"
        onClick={() => handleLogoClick()}
      >
        {displayLogo ? (
          <img
            className="object-cover object-center w-full h-60 cursor-pointer"
            alt="Activity Logo"
            src={displayLogo}
          />
        ) : (
          <div className="w-full h-60 flex items-center">
            <CloudUpload className="w-32 h-32 mx-auto cursor-pointer" />
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/jpeg, image/png"
      />
      <div className="flex items-center justify-center px-8 py-4 bg-success-500">
        <h1 className="text-xl font-bold text-white text-center">{name}</h1>
      </div>
    </div>
  );
};

export default ActivityDetailsCardLogo;
