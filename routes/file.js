const fs = require('fs')
const path = require('path')

const rootpath = './articles'

function readfile(filepath, callback) {
	// const filepath = path.join(rootpath, filename + '.md')
	const readStream = fs.createReadStream(filepath)
	let data = ''
	readStream.setEncoding('UTF8')
	readStream.on('data', (val) => (data += val))
	readStream.on('end', () => {
		callback({ success: true, error: null, data: data })
	})
	readStream.on('error', (err) => callback({ success: false, error: err }))
}

function writefile(filename, data, callback) {
	let filepath
	if (filename.split('.').reverse()[0] === 'md') {
		filepath = path.join(rootpath, filename)
	} else {
		filepath = path.join(rootpath, filename + '.md')
	}
	const writeStream = fs.createWriteStream(filepath)
	writeStream.write(data, 'UTF8')
	writeStream.end()
	writeStream.on('finish', () => {
		callback({ success: true, error: null, path: filepath })
	})
	writeStream.on('error', (err) => callback({ success: false, error: err }))
}

// writefile('this-is-title6', '12345', data => console.log(data))
// writefile('this-is-title6.md', '12345', data => console.log(data))

module.exports = { readfile, writefile }
