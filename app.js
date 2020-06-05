var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

var app = express()
// 跨域
app.all('*', (req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
	res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS')
	res.header('Access-Control-Allow-Headers', 'X-Requested-With')
	res.header('Access-Control-Allow-Headers', 'Content-Type')
	res.header('Access-Control-Allow-Credentials', true)
	next()
})

/* 设置session默认信息
const session = require('express-session')
app.use(
	session({
		secret: 'classweb531234', // 设置session签名
		name: 'classweb',
		cookie: { maxAge: 60 * 1000 * 60 * 24 }, // 存储时间24小时
		resave: false, // 每次请求都重新设置session
		saveUninitialized: true
	})
)
 */

// ==================================================================

/*
const backstage = ['console', 'writeALog', 'recycleBin', 'selfIntroduct']
function checkList(str) {
	for (let i = 0; i < backstage.length; i++) {
		if (str.indexOf(backstage[i]) !== -1) {
			return true
		}
	}
	return false
}
// 问题1：writeALog在写文章模式下没有对服务端发起请求(发送一个空请求，或者选用本地session控制)
// 问题2：客户端发起最初请求时，如果请求的是服务端页面，返回的数据并没有及时接收到，并提醒跳转

// 验证是否登录
app.use(function(req, res, next) {
	if (req.session.username) {
		next()
	} else if (checkList(req.headers.referer)) {
		// 当请求地址为后台页面且用户没有登录
		console.log(req.headers.referer)
		res.end('{ "redirect": true }')
	} else {
		next()
	}
})

*/
// ==================================================================

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('error')
})

module.exports = app
