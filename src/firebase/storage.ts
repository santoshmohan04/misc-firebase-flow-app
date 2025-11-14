'use client';

import { getStorage, ref, uploadBytes, getDownloadURL, listAll, StorageReference, FirebaseStorage } from 'firebase/storage';

/**
 * Uploads a profile image to Firebase Storage.
 * @param storage The FirebaseStorage instance.
 * @param file The image file to upload.
 * @param userId The ID of the user.
 * @returns The download URL of the uploaded image.
 */
export const uploadProfileImage = async (storage: FirebaseStorage, file: File, userId: string): Promise<string> => {
    const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};

/**
 * Lists all files for a user in their avatars directory.
 * @param storage The FirebaseStorage instance.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of file references.
 */
export const listUserFiles = async (storage: FirebaseStorage, userId: string): Promise<StorageReference[]> => {
    const userFolderRef = ref(storage, `avatars/${userId}`);
    try {
        const res = await listAll(userFolderRef);
        return res.items;
    } catch (error) {
        console.error("Error listing files:", error);
        return [];
    }
}
