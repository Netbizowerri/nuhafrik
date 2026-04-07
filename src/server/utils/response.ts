export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string;
}

export const sendSuccess = (res: any, data: any, message = 'Success', status = 200) => {
  const response: ApiResponse = {
    success: true,
    data,
    message
  };
  return res.status(status).json(response);
};

export const sendError = (res: any, message = 'Internal Server Error', error?: string, status = 500) => {
  const response: ApiResponse = {
    success: false,
    data: null,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  };
  return res.status(status).json(response);
};
