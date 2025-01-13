// src/utils/MigrateImages.ts
import { db } from "../config/firebase"; // Your Firebase configuration
import { collection, getDocs, updateDoc } from "firebase/firestore";
import uploadImage from "./UploadImage";

const migrateCourseImages = async (): Promise<void> => {
  const coursesRef = collection(db, "courses"); // Replace with your Firebase collection
  const querySnapshot = await getDocs(coursesRef);

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const imageUrl = data.imageUrl; // Replace with the field that contains the image URL

    try {
      const cloudinaryUrl = await uploadImage(imageUrl, "ml_default"); // Replace with your upload preset
      console.log(`Uploaded ${imageUrl} to Cloudinary: ${cloudinaryUrl}`);

      // Update your Firebase document with the new Cloudinary URL
      await updateDoc(doc.ref, { imageUrl: cloudinaryUrl }); // Update the imageUrl field
    } catch (error) {
      console.error(`Failed to upload ${imageUrl}:`, error);
    }
  }
};

export default migrateCourseImages;
