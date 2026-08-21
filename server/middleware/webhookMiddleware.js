const express = require('express');

const rawBodyParser = express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
});

module.exports = { rawBodyParser };
