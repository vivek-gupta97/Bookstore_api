const { Router } = require('express');
const bookController = require('../controller/book');
const { body } = require('express-validator');
const isAuth = require('../middleware/isAuth');
const router = Router();

router.get('', isAuth, bookController.getBooks);
router.post(
	'', 
	[
		body('name')
			.exists()
			.notEmpty()
			.withMessage('Name should not be empty'),
		body('author')
			.exists()
			.notEmpty()
			.withMessage('Author should not be empty'),
		body('category')
			.exists()
			.notEmpty()
			.withMessage('Category should not be empty'),
		body('price')
			.exists()
			.isFloat({ min: 0 })
			.withMessage('Price should not be empty'),
	],
	isAuth,
	bookController.postBook
);
router.patch(
	'/:id',
	[
		body('name')
			.exists()
			.notEmpty()
			.withMessage('Name should not be empty'),
		body('author')
			.exists()
			.notEmpty()
			.withMessage('Author should not be empty'),
		body('category')
			.exists()
			.notEmpty()
			.withMessage('Category should not be empty'),
		body('price')
			.exists()
			.isFloat({ min: 0 })
			.withMessage('Price should be number >= 0'),
	],
	isAuth ,
	bookController.editBook
);
router.delete('/:id',isAuth , bookController.deleteBook);

module.exports = router;
