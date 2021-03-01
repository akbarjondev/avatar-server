const express = require('express')
const path = require('path')

const app = express()

app.get('/user/:username', (req, res) => {
	// res.sendFile()

	res.send(req.params.username)
})

app.listen(3000, () => console.log('http://localhost:3000'))
