'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '.';

const { firebaseApp } = initializeFirebase();
const storage = getStorage(firebaseApp);

/**
 * Uploads a profile image to Firebase Storage.
 * @param file The image file to upload.
 * @param userId The ID of the user.
 * @returns The download URL of the uploaded image.
 */
export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
    const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
    
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error("Upload failed", error);
        // You can customize error handling here
        throw new Error(`Upload failed: ${error.message}`);
    }
};
