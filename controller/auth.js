const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('./../util/db');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation Error');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const { email, password } = req.body;
	bcrypt
		.hash(password, 12)
		.then((hashPW) => {
			return db.executeQuery(
				'CREATE (u:User{email:$email,password:$pass}) RETURN u',
				{ email: email, pass: hashPW }
			);
		})
		.then(({ records }) => {
			const user = { email: records[0].toObject().u.properties.email };
			res.status(200).json({
				message: 'Signup Successful \n Login to continue',
				user: user,
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
exports.login = (req, res, next) => {
	const { email, password } = req.body;
	let loadedUser;
	db.executeQuery('MATCH (u:User{email:$email}) RETURN u', {
		email: email,
	})
		.then(({ records }) => {
			if (records.length == 0) {
				const error = new Error(
					'A user with this email does not exists.'
				);
				error.statusCode = 401;
				throw error;
			}
			loadedUser = {
				...records[0].toObject().u.properties,
				id: records[0].toObject().u.identity.low,
			};
			return bcrypt.compare(password, loadedUser.password);
		})
		.then((isEqual) => {
			if (!isEqual) {
				const error = new Error('Invalid Password');
				error.statusCode = 401;
				throw error;
			}
			const token = jwt.sign(
				{
					email: loadedUser.email,
					userId: loadedUser.id,
				},
				process.env.JWT_SECRET,
				{ expiresIn: '1h' }
			);
			res.status(200).json({
				token: token,
				email: loadedUser.email,
				expiresIn: new Date(Date.now() + 3600000),
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
