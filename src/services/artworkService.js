import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore/lite";
import { db, QUERY_LIMIT } from "../lib/firebase";

const artworksCollection = collection(db, "artworks");

export const createArtwork = async (imageUrl, studentIds, fileName) => {
  try {
    const artworkRef = await addDoc(artworksCollection, {
      imageUrl,
      studentIds,
      fileName,
      createdAt: serverTimestamp(),
    });
    return { id: artworkRef.id, imageUrl, studentIds, fileName };
  } catch (error) {
    throw new Error(`Failed to create artwork: ${error.message}`);
  }
};

export const getArtworksForStudent = async (studentId) => {
  try {
    const querySnap = await getDocs(
      query(
        artworksCollection,
        where("studentIds", "array-contains", studentId),
        orderBy("createdAt", "desc"),
        limit(QUERY_LIMIT),
      ),
    );
    return querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error(`Failed to fetch artworks: ${error.message}`);
  }
};
