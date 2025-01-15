// src/utils/uploadImage.ts
import axios, { AxiosError } from "axios";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dncgoid7y/image/upload"; // Replace with your Cloudinary URL
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Ensure this is set correctly

const uploadImage = async (file: File, folder: string): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file); // Append the file to the form data
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); // Append the upload preset
  formData.append("folder", folder); // Optional: specify the folder

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Set the content type
      },
    });
    return response.data.secure_url; // Return the secure URL of the uploaded image
  } catch (error) {
    const axiosError = error as AxiosError; // Type assertion
    console.error(
      "Error uploading image to Cloudinary:",
      axiosError.response?.data
    ); // Log the error response
    throw new Error("Image upload failed");
  }
};

export default uploadImage;
