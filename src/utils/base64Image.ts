/**
 * Utility to convert a File object to a Base64 string.
 * This is used to store images directly in Firestore to avoid Firebase Storage paid-tier dependence.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please upload an image.'));
      return;
    }

    // Validate max size (e.g., 500KB to keep Firestore documents under 1MB)
    const MAX_SIZE = 500 * 1024;
    if (file.size > MAX_SIZE) {
      reject(new Error('File size too large. Please upload an image smaller than 500KB.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to Base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Helper to validate if a string is a valid Base64 image payload.
 */
export const isValidBase64Image = (payload: string): boolean => {
  return payload.startsWith('data:image/');
};
