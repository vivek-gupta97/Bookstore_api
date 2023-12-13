const db = require('./../util/db');
const { validationResult } = require('express-validator');

exports.getBooks = (req, res, next) => {
	db.executeQuery('MATCH (n:Book) RETURN n;')
		.then(({ records }) => {
			const books = records.map((rec) => ({
				...rec.get('n').properties,
				id: rec.get('n').identity.low,
			}));
			res.status(200).json({
				message: 'Fetch Books successfull',
				data: books,
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

exports.postBook = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation Error');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}

	req.body.price = +req.body.price;
	if (isNaN(req.body.price)) {
		const error = new Error('Price is not a number');
		error.statusCode = 422;
		throw error;
	}

	db.executeQuery(
		'CREATE (b:Book{name:$name,author:$author,category:$category,price:$price}) RETURN b',
		req.body
	)
		.then(({ records }) => {
			const book = {
				...records[0].get('b').properties,
				id: records[0].get('b').identity.low,
			};
			res.status(200).json({ message: 'Book Added', data: book });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
exports.deleteBook = (req, res, next) => {
	db.executeQuery('MATCH (b:Book) WHERE ID(b)=$id DELETE b RETURN b', {
		id: +req.params.id,
	})
		.then(({ records }) => {
			if (records.length == 0) {
				const error = new Error('Invalid id of book');
				error.statusCode = 404;
				throw error;
			}
			const book = {
				id: records[0].get('b').identity.low,
			};
			res.status(200).json({ message: 'Book Deleted', data: book });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
exports.editBook = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation Error');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	req.body.price = +req.body.price;
	if (isNaN(req.body.price)) {
		const error = new Error('Price is not a number');
		error.statusCode = 422;
		throw error;
	}
	const id = +req.params.id;

	db.executeQuery(
		'MATCH (b:Book) WHERE ID(b)=$id SET b = {name:$name,author:$author,price:$price,category:$category} RETURN b',
		{ ...req.body, id: id }
	)
		.then(({ records }) => {
			if (records.length == 0) {
				const error = new Error('Invalid id for book update');
				error.statusCode = 404;
				throw error;
			}
			const book = {
				...records[0].get('b').properties,
				id: records[0].get('b').identity.low,
			};
			res.status(200).json({ message: 'Book Updated', data: book });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
