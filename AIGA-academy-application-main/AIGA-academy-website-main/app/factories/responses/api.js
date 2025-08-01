const FORMATS = {
  JSON: "JSON"
};

module.exports = {
  createOKResponse: _createOKResponse,
  createErrorResponse: _createErrorResponse
};

function _createGenericResponse(options = { res: null, status: 200, content: {}, error: null, format: FORMATS.JSON }) {
  try {
    const data = {
      content: options?.content ?? null,
      error: options?.error ?? null
    };

    if (options?.format === FORMATS.JSON) {
      return options?.res.status(options?.status).json(data);
    } else {
      throw new Error("Unsupported response format.");
    }
  } catch (error) {
    const err = new Error(`Could not create generic response: ${error.message}`);
    err.name = error?.name;
    err.code = error?.code;
    throw err;
  }
}

function _createOKResponse(options) {
  return _createGenericResponse({
    ...options,
    status: 200,
    format: options?.format ?? FORMATS.JSON
  });
}

function _createErrorResponse(options) {
  return _createGenericResponse({
    ...options,
    status: options?.status ?? 500,
    format: options?.format ?? FORMATS.JSON
  });
}
