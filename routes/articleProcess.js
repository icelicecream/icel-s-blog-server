const fs = require('fs')
const path = require('path')
const file = require('./file.js')

// 生成10位随机序列
function random() {
	return Number(Math.random().toString().substr(3, 10) + Date.now())
		.toString(36)
		.slice(0, 10)
}

// 生成没有空格的名字
function createFileName(filename) {
	const wordArr = filename.split(/\s+/)
	let newArr = []
	const regexp = /^[-_]+$/
	for (let i = 0; i < wordArr.length; i++) {
		// 前一个尾部有-
		// 后一个头部有-
		// -为独立字节
		if (regexp.test(wordArr[i])) {
			// -_为占独立单词位置
			continue
		}
		if (/[-_]+/.test(wordArr[i])) {
			const pos = /[-_]+/.exec(wordArr[i]).index
			if (pos === 0) {
				// -_在单词开头
				const length = /[-_]+/.exec(wordArr[i])[0].split('').length
				newArr.push(wordArr[i].substr(length))
			} else {
				// -_在单词结尾
				newArr.push(wordArr[i].substr(0, pos))
			}
		} else {
			newArr.push(wordArr[i])
		}
		newArr.push('-')
	}
	const newName = newArr.reverse().slice(1).reverse().join('')
	return newName
}

// 写入文章
function writeArticle(filename, content, callback) {
	file.writefile(filename, content, (data) => {
		if (data.success === true) {
			callback({ success: true, error: null, path: data.path })
		} else {
			callback({ success: false, error: data.error })
		}
	})
}

// 读取文章
function readArticle(filepath, callback) {
	file.readfile(filepath, (data) => {
		if (data.success === true) {
			callback({ success: true, error: null, data: data.data })
		} else {
			callback({ success: false, error: data.error })
		}
	})
}

//生成保存路径(没有后缀名)
function getFilePath(filename, relativePath) {
	relativePath = relativePath || '../articles' //　默认文章所在路径
	return path.join(__dirname, relativePath, createFileName(filename))
}

// 删除文件
function deleteFile(path, callback) {
	if (fs.existsSync(path)) {
		fs.unlink(path, (err) => {
			if (err) callback(`{"success":false, "error":${err}`)
			callback({ success: true })
		})
	} else {
		callback({ success: false, error: 'File not found' })
	}
}

module.exports = {
	random,
	createFileName,
	writeArticle,
	readArticle,
	getFilePath,
	deleteFile,
}
