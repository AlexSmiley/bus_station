export function notFoundHandler(_request, response) {
  response.status(404).json({
    error: { code: 'NOT_FOUND', message: 'The requested resource was not found.' }
  });
}

export function errorHandler(error, _request, response, _next) {
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
    ? error.status
    : 500;

  response.status(status).json({
    error: {
      code: status === 500 ? 'INTERNAL_SERVER_ERROR' : (error.code ?? 'REQUEST_ERROR'),
      message: status === 500 ? 'An unexpected error occurred.' : error.message
    }
  });
}
