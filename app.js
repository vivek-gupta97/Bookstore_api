const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./util/db');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/book');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization'
	);
	next();
});
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

db.getServerInfo().then((res) => {
	app.listen(process.env.PORT, () => {
		console.log('Server Started at port', process.env.PORT);
	});
});
