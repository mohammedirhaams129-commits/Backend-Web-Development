function sendData(res, status, data) {
  return res.status(status).json({ data });
}

function sendList(res, data, meta) {
  return res.status(200).json({ data, meta });
}

function sendCreated(res, data) {
  return sendData(res, 201, data);
}

function sendOk(res, data) {
  return sendData(res, 200, data);
}

function sendError(res, status, code, message) {
  return res.status(status).json({
    error: {
      code,
      message
    }
  });
}

module.exports = {
  sendList,
  sendCreated,
  sendOk,
  sendError
};
