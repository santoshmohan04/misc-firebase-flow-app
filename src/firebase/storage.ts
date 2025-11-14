'use client';

import { FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User } from 'firebase/auth';

/**
 * Uploads a profile image to Firebase Storage and returns the download URL.
 * @param storage - The Firebase Storage instance.
 * @param user - The authenticated user object.
 * @param file - The image file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadProfileImage(storage: FirebaseStorage, user: User, file: File): Promise<string> {
  if (!user) {
    throw new Error('User must be authenticated to upload a profile image.');
  }

  // Create a storage reference
  const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);

  // Upload the file
  const uploadResult = await uploadBytes(storageRef, file);

  // Get the download URL
  const downloadURL = await getDownloadURL(uploadResult.ref);

  return downloadURL;
}
