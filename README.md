# icel's blog server

<hr/>

#### 启动服务

`npm start`

#### 数据库结构

​		本项目采用的是MongoDB作为数据存储的数据库，主要存储三部分数据

+ articlelist：存储关于博客的数据

  ``````json
  {
      "_id" : ObjectId("5d91f8bacd02f3c96484abae")，
      "uniqid" : "zra85cq648",
      // 文章标题
      "title" : "Getting Started with ES6 - 1",
  	// 小标题（前言）
      "subtitle" : "let, const, spread, operator, template strings, default params",
      "createtime" : "2017-04-12",
      "tags" : [ 
          "es6", 
          "esma2015", 
          "javascript"
      ],
  	// 文章是以md的形式进行保存，path中储存的就是该文章在服务器中保存的位置
      "path" : "articles\\Getting-Started-with-ES6-1.md",
  	// 是否隐藏（不在主页面上展示）
      "hide" : false,
  	// 是否删除（放入回收站）
      "delete" : false
  }
  ``````

+ comments：储存每篇文章的评论

  ``````json
  {
      "_id" : ObjectId("5d96afe17f232751d4464cbc"),
      // 指的是这条回复对应的文章的uniqid
      "articleid" : "d5z7zpz7dm",
  	// 评论人的姓名
      "name" : "****",
      "floor" : 1,
      "time" : "2019.08.17 13:24",
      // 评论的内容
      "content" : "******",
      // 如果该评论是回复前一个人的评论的话，reply会储存上一个评论的floor值
      "reply" : 0
  }
  ``````

+ user：储存博主的信息

  ``````json
  {
      "_id" : ObjectId("5d90aaffba2493922df9b4ce"),
      "name" : "****",
      "signature" : "******",
      "introduce" : "******",
      "imgsrc" : "http://localhost:3000/images/img1.png",
      "email" : "******",
      // 原程序在审核密码前，会先对用户输入的密码进行base64加密，然后再与数据库中的密码进行对比
      "password" : "*******"
  }
  ``````

#### 文章

​		本项目中文章会保存在`./article`中，已md的格式进行储存。文章有以下几种状态：

1. 既不选择hide，也不选择delete：指的是后台可以看到文章，并且该文章会展示在前台
2. hide：指的是后台可以看到文章，但前台并不展示文章
3. delete：指的是后台也不会看到文章，该文章归档到回收站
4. 回收站的文章可以进行恢复，也可以进行彻底的删除（删除服务器中保存的md文件）

#### 图片

​		本项目允许博主在文章中添加图片，该图片需要上传到服务器中，会自动保存在`./public/images`文件夹中。不过对于同名的图片文件，本项目并没有进行独立文件名的设计，因此可能会存在覆盖现象，请谨慎。同样，博主的头像图片也会上传到该文件夹中，建议使用方形的图片。