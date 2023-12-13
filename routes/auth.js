const { Router } = require('express');
const { body } = require('express-validator');
const db = require('../util/db');
const authController = require('../controller/auth');
const router = Router();

router.put(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a Valid Email')
			.normalizeEmail()
			.custom((value, { req }) => {
				return db
					.executeQuery('MATCH (u:User{email:$email}) RETURN u', {
						email: value,
					})
					.then(({ records }) => {
						if (records.length > 0)
							return Promise.reject('Email Already exists');
					});
			}),
		body('password')
			.trim()
			.isLength({ min: 8 })
			.withMessage('Password must be of atleast 8 length'),
		body('confirmPassword')
			.trim()
			.custom((value, { req }) => {
				if (req.body.password !== value) {
					throw new Error('Confirm Password does not match');
				}
				return true;
			}),
	],
	authController.signup
);
router.post('/login', [body('email').normalizeEmail()], authController.login);

module.exports = router;
