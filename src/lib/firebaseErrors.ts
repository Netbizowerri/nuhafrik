type FirebaseErrorLike = {
  code?: string;
  message?: string;
};

const asFirebaseError = (error: unknown): FirebaseErrorLike | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  return error as FirebaseErrorLike;
};

export const isPermissionDeniedError = (error: unknown) => {
  const firebaseError = asFirebaseError(error);
  const code = firebaseError?.code?.toLowerCase() || '';
  const message = firebaseError?.message?.toLowerCase() || '';

  return (
    code === 'permission-denied' ||
    code === 'firestore/permission-denied' ||
    message.includes('missing or insufficient permissions') ||
    message.includes('permission denied')
  );
};
