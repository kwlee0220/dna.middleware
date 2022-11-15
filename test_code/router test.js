const express = require('express');
const route = express.Router();
const cctvRtsp = require('../controller/cctvRestApi_controller');

cctvRtsp.createData()