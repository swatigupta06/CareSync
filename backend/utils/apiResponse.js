/**
 * Standardised API response helpers.
 * Every controller should use these to keep response shape consistent.
 */

const success = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const created = (res, data = {}, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const notFound = (res, resource = 'Resource') => {
  return error(res, `${resource} not found`, 404);
};

const forbidden = (res, message = 'Access denied') => {
  return error(res, message, 403);
};

module.exports = { success, created, error, notFound, forbidden };
