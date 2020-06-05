const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
const assert = require('assert') // nodejs 断言库
const url = require('url')
const host = 'localhost'
const port = '27017'
const Urls = 'mongodb://localhost:27017/blog'

const add = (db, collections, selector, fn) => {
	const collection = db.collection(collections)
	collection.insertMany([selector], (err, result) => {
		try {
			assert.equal(err, null) // 存在错误时会抛出错误
		} catch (e) {
			console.log(e)
			result = []
		}
		fn(result)
		db.close()
	})
}

const deletes = (db, collections, selector, fn) => {
	const collection = db.collection(collections)
	collection.deleteOne(selector, (err, result) => {
		try {
			assert.equal(err, null)
			assert.notStrictEqual(0, result.result.n)
		} catch (e) {
			console.log(e)
			result.result = ''
		}
		// 如果没有报错且返回数据不是0，那么表示操作成功
		fn(result.result ? [result.result] : [])
		db.close()
	})
}

const find = (db, collections, selector, fn) => {
	const collection = db.collection(collections)
	collection.find(selector).toArray((err, result) => {
		try {
			assert.equal(err, null)
		} catch (e) {
			console.log(e)
			result = []
		}
		fn(result)
		db.close()
	})
}

const updates = (db, collections, selector, fn) => {
	const collection = db.collection(collections)
	collection.updateOne(selector[0], selector[1], (err, result) => {
		try {
			assert.equal(err, null)
			assert.notStrictEqual(0, result.result.n)
		} catch (e) {
			console.log(e)
			result.result = ''
		}
		// 如果没有报错且返回数据不是0，那么表示操作成功
		fn(result.result ? [result.result] : [])
		db.close()
	})
}

const methodType = {
	login: find,
	list: find,
	updateList: updates,
	deleteList: deletes,
	information: find,
	updateInformation: updates,
	saveArticle: add,
	updateArticle: updates,
	findArticle: find,
	comments: find,
	savecomments: add,
	avatar: updates,
}

module.exports = (req, res, collections, selector, fn) => {
	MongoClient.connect(Urls, (err, db) => {
		assert.equal(null, err)
		console.log('Connected correctly to server')
		// req.route.path => 防止前端请求直接操作数据库
		// 根据请求的地址来确定是什么操作（为了安全，避免前端直接通过请求url操作数据库）
		methodType[req.route.path.substr(1)](db, collections, selector, fn)
		db.close()
	})
}
