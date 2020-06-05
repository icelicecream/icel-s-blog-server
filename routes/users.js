const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const handler = require('./dbhandler.js')
const process = require('./articleProcess.js')
const time = require('./time.js')
const comments = require('./comments.js')
// 加密包
const crypto = require('crypto')

// 缓存用户数据
const userInformation = {
	name: '',
	signature: '',
	introduce: '',
	imgsrc: '',
	email: '',
}

// 对比用户名和密码
router.post('/login', (req, res, next) => {
	console.log(req.body)
	const md5 = crypto.createHash('md5')
	const password = md5.update(req.body.password).digest('base64')

	handler(req, res, 'user', { name: req.body.username }, (data) => {
		if (data.length === 0) {
			res.json({ err: '抱歉， 系统中并无该用户，如有需要，请向管理员申请' })
		} else if (data[0].password !== password) {
			res.json({ err: '密码不正确' })
		} else if (data.length !== 0 && data[0].password === password) {
			res.json({ success: true })
		}
	})
})

// 退出登錄
router.post('/logout', (req, res, next) => {
	res.json({ success: true })
})

//　查询列表
router.post('/list', (req, res, next) => {
	// console.log(req.route.path.substr(1))
	handler(req, res, 'articlelist', req.body, (data) => {
		if (data.length !== 0) {
			res.json(data)
		} else {
			res.json({ success: false })
		}
	})
})

// 修改列表
router.post('/updateList', (req, res, next) => {
	handler(req, res, 'articlelist', req.body, (data) => {
		console.log(data)
		if (data[0].ok === 1) {
			res.json({ success: true })
		} else {
			res.json({ success: false })
		}
	})
})

// 删除文章
router.post('/deleteList', (req, res, next) => {
	// 删除服务端保存的文件
	console.log(req.body)
	const filePath = process.getFilePath(req.body.title) + '.md'
	process.deleteFile(filePath, (result) => {
		if (result.success === false) {
			res.json({ error: result.error })
			return false
		}
		// 已删除文件
		// 删除数据库中的数据
		handler(req, res, 'articlelist', { uniqid: req.body.uniqid }, (data) => {
			if (data[0] && data[0].ok === 1) {
				res.json({ success: true })
			} else {
				res.json({ success: false })
			}
		})
	})
})

// 隐藏文章
router.post('/hide', (req, res, next) => {
	// const uniqid = req.body.uniqid
	// const hideStatus = req.body.hide
	handler(req, res, 'articlelist', req.body, (data) => {
		if (data.length !== 0) {
			res.json({ success: true })
		} else {
			res.json({ success: false })
		}
	})
})

// 查询用户信息
router.post('/information', (req, res, next) => {
	if (
		// 检验保存信息的完整
		userInformation.name &&
		userInformation.signature &&
		userInformation.introduce &&
		userInformation.imgsrc &&
		userInformation.email
	) {
		res.json(userInformation)
		return false
	}
	handler(req, res, 'user', req.body, (data) => {
		if (data.length !== 0) {
			// 记录用户信息
			userInformation.name = data[0].name
			userInformation.signature = data[0].signature
			userInformation.introduce = data[0].introduce
			userInformation.imgsrc = data[0].imgsrc
			userInformation.email = data[0].email
			res.json(userInformation)
		} else {
			res.json({ error: 'no user data' })
		}
	})
})

// 修改用户信息
router.post('/updateInformation', (req, res, next) => {
	handler(req, res, 'user', req.body, (data) => {
		if (data.length !== 0) {
			console.log(data)
			if (req.body.name) {
				userInformation.name = req.body.name
			}
			userInformation.signature = req.body.signature
			userInformation.introduce = req.body.introduce
			userInformation.email = req.body.email
			res.json({ success: true })
		} else {
			res.json({ success: false })
		}
	})
})

// 写入文章
// 重名文章会覆盖
router.post('/saveArticle', (req, res, next) => {
	// 列表信息
	// {
	//   "_id" : ObjectId("5d91f8f2cd02f3c96484abc5"), // 系统自动生成
	//   "uniqid" : "2o46r9sue8",
	//   "title" : "JavaScript - Call vs Apply vs Bind",
	//   "subtitle" : "Let's find when and why to use call, apply, bind in javascript",
	//   "createtime" : "2018-01-06",
	//   "tags" : [
	//       "javascript",
	//       "js-core"
	//   ],
	//   "path" : "../articles/JavaScript-Call-vs-Apply-vs-Bind.md",
	//   "comments" : "5",
	//   "hide" : false,
	//   "delete" : false
	// }
	// 拆出标题，标签，副标题，文章 	// 记录时间 // 生成路径 // 生成uniqid // 组合成object
	const article = req.body.article
	const filename = process.createFileName(req.body.title)

	process.writeArticle(filename, article, (result) => {
		if (result.success === true) {
			const uniqid = process.random()
			const obj = {
				uniqid: uniqid,
				title: req.body.title,
				subtitle: req.body.subtitle,
				createtime: time.getTime(),
				tags: req.body.tags,
				path: result.path,
				hide: true,
				delete: false,
			}
			handler(req, res, 'articlelist', obj, (data) => {
				if (data.result && data.result.ok === 1) {
					res.json({ success: true })
				} else {
					res.json({ success: false })
					console.log(data)
				}
			})
		} else {
			res.json({ success: false })
			console.log(result.error)
		}
	})
})

// 修改文章
router.post('/updateArticle', (req, res, next) => {
	console.log(req.body)
	const article = req.body.article
	const update = req.body.update[1].$set

	process.writeArticle(
		process.createFileName(update.title),
		article,
		(result) => {
			console.log(result)
			if (result.success === true) {
				handler(req, res, 'articlelist', req.body.update, (data) => {
					console.log(data)
					if (data[0] && data[0].ok === 1) {
						res.json({ success: true })
					} else {
						res.json({ success: false })
						console.log(data)
					}
				})
			} else {
				res.json({ success: false })
				console.log(result.error)
			}
		}
	)
})

// 查询文章
router.post('/findArticle', (req, res, next) => {
	const uniqid = req.body.uniqid
	handler(req, res, 'articlelist', { uniqid: uniqid }, (data) => {
		if (data.length === 0) {
			console.log("file can't find")
			res.json({ success: false })
		} else {
			const articlePath = data[0].path
			process.readArticle(articlePath, (article) => {
				res.json({
					title: data[0].title,
					tags: data[0].tags,
					subtitle: data[0].subtitle,
					createTime: data[0].createtime,
					article: article,
				})
			})
		}
	})
})

// 查询评论列表
let commentslist = []
let commentstree = []
let commentslength = 0
router.post('/comments', (req, res, next) => {
	handler(req, res, 'comments', req.body, (data) => {
		if (data.length === 0) {
			console.log('document is not find')
			res.json({ success: false })
		} else {
			commentslist = data
			commentstree = comments.commentsTree(data)
			commentslength = data.length
			res.json({ commentslist, commentstree, commentslength })
		}
	})
})

// 保存评论
router.post('/savecomments', (req, res, next) => {
	// 生成时间
	const createtime = time.getFullTime()
	// 组合保存用的数据
	const obj = {
		articleid: req.body.articleId,
		name: req.body.name,
		floor: req.body.floor,
		time: createtime,
		content: req.body.value,
		reply: req.body.reply,
	}
	handler(req, res, 'comments', obj, (data) => {
		if (data.result.ok === 1) {
			res.json({ success: true })
		} else {
			res.json({ success: false })
		}
	})
})

// 添加图片 // 重复多次重定向，需要修改
// 重名图片会覆盖

const storage = multer.diskStorage({
	destination(req, file, cb) {
		cb(null, path.join(__dirname, '../public/images'))
	},
	filename(req, file, cb) {
		cb(null, file.originalname.replace(/\s/g, '-'))
	},
})
const upload = multer({
	storage: storage,
}).single('imgFile')

router.post('/image', (req, res, next) => {
	console.log(req.file)
	upload(req, res, (err) => {
		console.log('上传中')
		if (err) {
			console.log(err)
			res.json(err.message)
			return false
		}
		let url = 'http://' + req.headers.host + '/images/' + req.file.filename
		res.json({ url: url })
		console.log('上传完成')
		console.log('文件信息')
		console.log(req.file ? req.file : '文件错误')
	})
})

// 设置头像图片 avatar
router.post('/avatar', (req, res, next) => {
	// 删除以前的头像文件
	let lastImgName = userInformation.imgsrc
	lastImgName = lastImgName.match(/images\/(.*)/)[1]
	const lastImgPath = path.join(__dirname, '../public/images', lastImgName)
	process.deleteFile(lastImgPath, (result) => {
		if (result.success) {
			console.log('已删除文件')
		} else {
			console.log('文件未找到')
		}
	})

	// 添加新的头像文件
	upload(req, res, (err) => {
		if (err) {
			console.log(err)
			res.json(err.message)
			return false
		}
		const imgurl = 'http://' + req.headers.host + '/images/' + req.file.filename
		const whereStr = { uniqid: userInformation.uniqid }
		const updateStr = { $set: { imgsrc: imgurl } }
		handler(req, res, 'user', [whereStr, updateStr], (data) => {
			if (data[0].ok && data[0].ok === 1) {
				// 修改服务端的记录
				userInformation.imgsrc = imgurl
				res.json({ success: true })
			} else {
				res.json({ success: false })
			}
		})
	})
})

// 删除图片
router.post('/deleteImage', (req, res, next) => {
	// const imgPath = process.getFilePath(req.body.filename, '../public/images')
	const imgPath = path.join(__dirname, '../public/images', req.body.filename)
	console.log(imgPath)
	process.deleteFile(imgPath, (result) => {
		res.json(result)
	})
})

module.exports = router
