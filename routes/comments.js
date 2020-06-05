// 生成评论列表
function commentsTree(commentsList) {
	let arr = []
	commentsList.map((val) => {
		let obj = { pos: val.floor - 1, isArray: false, reply: [] }
		if (val.reply) {
			obj.isArray = true
			const replyTarget = arr[val.reply - 1]
			if (replyTarget.isArray) {
				obj.reply = replyTarget.reply.concat([replyTarget.pos])
			} else {
				obj.reply = [replyTarget.pos]
			}
		}
		arr.push(obj)
	})
	return arr.reverse()
}

module.exports = { commentsTree }
