docToHtml
====================
将.docx转换成HTML


## Usage
- npm install doc2html
- cd doc2html
- npm install
- 在run.js中传入配置 `require('./index)({fileDir: './src'})`
- node run.js

### 配置config.js
* fileDir: 'docx源目录',
* outputDir: '输出目录',
* head: "头部内容",
* footer: "尾部内容"