const { compress } = require('compress-images/promise');
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

	const [ selectedUser ] = await fetch(`
		select 
			user_avatar
		from
			users
		where
			user_username = $1
	`, username)

	if(selectedUser) {
		if(selectedUser.user_avatar) {
			res.sendFile(path.join(__dirname + '/src/files/' + selectedUser.user_avatar))
		} else {
			res.sendFile(path.join(__dirname + '/src/public/img/ant.jpg'))
		}
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
		fs.readFile((__dirname + '/src/compressed/img/' + selectedImage.user_avatar), (err, data) => {
			
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
    const INPUT_path_to_your_images = 'src/files/**/*.{jpg,JPG,jpeg,JPEG,png}';
    const OUTPUT_path = 'src/compressed/img/';

    const processImages = async () => {
        const result = await compress({
            source: INPUT_path_to_your_images,
            destination: OUTPUT_path,
            enginesSetup: {
                jpg: { engine: 'mozjpeg', command: ['-quality', '60']},
                png: { engine: 'pngquant', command: ['--quality=20-50', '-o']},
            }
        });

        const { statistics, errors } = result;
        // statistics - all processed images list
        // errors - all errros happened list
    };

    processImages();
	} catch(e) {
		console.log(e)
	}

	try {
		const { filename } = req.file
		const { username } = req.body

		console.log(username, filename)

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
