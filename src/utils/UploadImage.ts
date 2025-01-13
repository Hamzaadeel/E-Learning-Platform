// src/utils/uploadImage.ts
import axios from "axios";

const uploadImage = async (
  image: string | File,
  uploadPreset: string
): Promise<string> => {
  const formData = new FormData();

  // Check if the image is a URL or a File object
  if (typeof image === "string") {
    formData.append("file", image); // For URLs, Cloudinary will handle it
  } else {
    formData.append("file", image); // For local files
  }

  formData.append("upload_preset", uploadPreset); // Use your unsigned upload preset

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dncgoid7y/image/upload`, // Replace with your Cloudinary URL
      formData
    );
    return response.data.secure_url; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};

export default uploadImage;
