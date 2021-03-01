const express = require('express')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const ejs = require('ejs')

// db
const { fetch } = require('./src/db/db.js')

const app = express()
app.use(express.json())
app.use(express.static(__dirname + '/src/public/'))

app.use(cors())
app.engine('html', ejs.renderFile)
app.set('views', 'src/views')
app.set('view engine', 'html')


// multer
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './src/files')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now() + '.' + (file.mimetype.split('/'))[1])
	}
})
const upload = multer({ storage })

// get routes
app.get('/', (req, res) => {

	res.render('index.html')
})

app.get('/user/:username', (req, res) => {
	// res.sendFile()

	res.send(req.params.username)
})

app.get('/profile/:username', (req, res) => {
	// res.renderFile()

	res.send(req.params.username)
})


// post routes
app.post('/upload', upload.single('avatar'), async (req, res) => {

	try {
		const { filename } = req.file
		const { username } = req.params

		// await fetch()

		res.send({
			status: 200,
			message: 'Image was uploaded'
		})
	} catch(e) {
		console.log(e)

		res.send({
			status: 400,
			message: e.message
		})
	}

})

app.listen(3000, () => console.log('http://localhost:3000'))
