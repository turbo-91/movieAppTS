import { NextApiResponse } from "next";

const handleApiError = (
  res: NextApiResponse,
  message: string,
  error: any,
  statusCode = 500
) => {
  return res
    .status(statusCode)
    .json({ success: false, status: message, error: error.message || error });
};

export default handleApiError;
