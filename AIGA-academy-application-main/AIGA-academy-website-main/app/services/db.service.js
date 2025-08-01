// ORM.
const Sequelize = require('sequelize');
// Connection configs.
const Configs = require('#configs/database');

const connection = new Sequelize(
	Configs.database,
	Configs.username,
	Configs.password,
	{
		host: Configs.host,
		port: Configs.port,
		dialect: Configs.dialect,
		pool: Configs.pool,
		charset: Configs.charset,
		collate: Configs.collate,
		timestamps: Configs.timestamps,
		logging: Configs.logging
	}
);

let _isAssociated = false; // 👈 кэш ассоциаций

module.exports = connection;
module.exports.service = DBService;
module.exports.migrate = _migrate;

function DBService() {
	const _authenticateDB = () => connection.authenticate();

	const _start = async () => {
		try {
			_authenticateDB();

			// Подключаем все модели.
			require('#models/');

			const models = connection.models;

			// Ассоциируем один раз.
			await _associateModels(models);

			console.info(`Database info: ${Object.keys(models).length} models associated.`);
			console.info('\x1b[1m', 'Connection to the database is fully operational', '\x1b[0m');

			return Promise.resolve(connection);
		} catch (error) {
			console.error('Unable to connect to the database:', error);
			return Promise.reject(error);
		}
	};

	return {
		start: _start
	};
}

function _migrate(environment, force = false) {
	if (environment !== 'development') {
		console.error(`Could not migrate in env ${environment}`);
		return;
	} else if (typeof force !== 'boolean') {
		console.error("Wrong force parameter; must be boolean");
		return;
	}

	const _successfulDBMigration = () => (
		console.log('Successful migration')
	);

	return connection
		.authenticate()
		.then(() => {
			console.log('Models to sync:', connection.models);

			return _associateModels(connection.models)
				.then(() => connection.sync({ force }))
				.then(_successfulDBMigration)
				.catch(console.error);
		})
		.catch(console.error);
}

// С добавленным кэшированием
async function _associateModels(models) {
	if (_isAssociated) {
		return models; // уже связаны
	}

	return new Promise((resolve, reject) => {
		try {
			Object.keys(models).forEach(modelName => {
				if (typeof models[modelName].associate === 'function') {
					models[modelName].associate(models);
				}
			});

			_isAssociated = true; // кэшируем ибру
			resolve(models);
		} catch (error) {
			reject(error);
		}
	});
}
