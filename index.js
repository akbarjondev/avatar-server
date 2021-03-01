const express = require('express')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const http = require('http')
const ejs = require('ejs')
const fs = require('fs')

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

app.get('/user/:username', async (req, res) => {
	const { username } = req.params

	const [ selectedImage ] = await fetch(`
		select 
			user_avatar
		from
			users
		where
			user_username = $1
	`, username)

	if(selectedImage) {
		res.sendFile(path.join(__dirname + '/src/files/' + selectedImage.user_avatar))
	} else {
		res.send({
			status: 401,
			message: 'No such user'
		})
	}

})

app.get('/profile/:username', async (req, res) => {
	
	const { username } = req.params

	const [ selectedImage ] = await fetch(`
		select 
			user_avatar
		from
			users
		where
			user_username = $1
	`, username)

	if(selectedImage) {
		fs.readFile((__dirname + '/src/files/' + selectedImage.user_avatar), (err, data) => {
			
			if(err) {
				console.log('error: ' + err)
			}

			res.writeHead(200, { 'Content-Type': `image/jpeg` })
			res.end(data)
		})

	} else {
		res.send({
			status: 401,
			message: 'No such user'
		})
	}

})


// post routes
app.post('/upload', upload.single('avatar'), async (req, res) => {

	try {
		const { filename } = req.file
		const { username } = req.body

		const data = await fetch(`
			update 
				users
			set 
				user_avatar = $1 
			where 
				user_username = $2
			returning 
				user_username
			`, filename, username)

		if(data.length > 0) {
			res.send({
				status: 200,
				message: 'Image was uploaded',
				data: data
			})
		} else {
			res.send({
				status: 401,
				message: 'User not found'
			})
		}

	} catch(e) {
		console.log(e)

		res.send({
			status: 400,
			message: e.message
		})
	}

})

app.listen(3000, () => console.log('http://localhost:3000'))
