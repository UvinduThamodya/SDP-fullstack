import React from "react";

const CLOUD_NAME = "<ddly9e3qr>"; // replace with your cloud name
const UPLOAD_PRESET = "menuitem_upload_preset"; // your unsigned preset

const ImageUploader = ({ onUpload }) => {
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      onUpload(data.secure_url);
    } catch (error) {
      console.error("Upload to Cloudinary failed:", error);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
      />
    </div>
  );
};

export default ImageUploader;
