// routes/bookRoutes.js
const express = require('express');
const { getBooks, getGenres } = require('../controllers/books');
const router = express.Router();

router.get('/genres', getGenres);
router.get('/', getBooks);

module.exports = router;
