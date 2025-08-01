const bcrypt = require('bcrypt');


module.exports = {
	hashPassword: (user) => {
		const salt = bcrypt.genSaltSync();
		const hash = bcrypt.hashSync(user.password, salt);

		return hash;
	},
	comparePasswords: (password, hash) => bcrypt.compareSync(password, hash)
}
function hashPassword(userOrPassword) {
	const password = typeof userOrPassword === 'string'
		? userOrPassword
		: userOrPassword?.password;

	if (isHashed(password)) {
		return password;
	}

	return bcrypt.hashSync(password, 10);
}

function isHashed(password) {
	return typeof password === 'string' && password.startsWith('$2');
}
