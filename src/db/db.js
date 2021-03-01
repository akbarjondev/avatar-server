const Pool = require('pg').Pool

const pool = new Pool({
	user: 'postgres',
	password: '11235',
	database: 'd35',
	host: 'localhost',
	port: 5432
})

const fetch = async (SQL, ...params) => {
	const client = await pool.connect()
	
	try {
		console.log('connect db')
		const { rows } = await client.query(SQL, params)
		
		return rows
	} catch(e) {
		console.log(e)

		return {
			code: 500,
			message: e.message
		}
	} finally {
		client.release()
		console.log('disconnect db...')
	}
}

module.exports.fetch = fetch
