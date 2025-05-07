const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

router.get('/search', auth, bookController.searchBooks);
router.get('/:id', auth, bookController.getBookById);

module.exports = router;
