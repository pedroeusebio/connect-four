function mapErrorDetails(details) {
	return details.map((item) => ({
		message: item.message,
		path: item.path,
		type: item.type,
	}));
}

module.exports = { mapErrorDetails };
