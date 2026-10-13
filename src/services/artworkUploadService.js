import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "../lib/firebase";
import { compressImage } from "../utils/image";

const storage = getStorage(app);

const uniqueFileName = (name) =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${name}`;

export const uploadArtworkImage = async (image) => {
  try {
    const fileName = uniqueFileName(image.name);
    const storageRef = ref(storage, `student_artworks/${fileName}`);
    await uploadBytes(storageRef, await compressImage(image));
    const downloadURL = await getDownloadURL(storageRef);
    return { fileName, downloadURL };
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};
