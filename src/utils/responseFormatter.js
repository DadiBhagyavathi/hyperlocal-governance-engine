/**
 * Standard success response
 */
const successResponse = ({
  message = "Success",
  data = null,
  meta = {},
}) => {
  return {
    success: true,
    message,
    data,
    meta,
  };
};

/**
 * Standard error response
 */
const errorResponse = ({
  message = "Something went wrong",
  error = null,
  statusCode = 500,
}) => {
  return {
    success: false,
    message,
    error,
    statusCode,
  };
};

module.exports = {
  successResponse,
  errorResponse,
};