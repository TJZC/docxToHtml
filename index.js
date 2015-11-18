var mammoth = require('mammoth');
var fs = require("fs");
var glob = require("glob");
var path = require("path");
var mkdir = require('mkdir-p');
var beautify_html = require('js-beautify').html;

var config = {
    fileDir: './docx',
    outputDir: './dist',
    head: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <title><\/title>\n',
    footer: "\n<\/body>\n<\/html>"
};

var fileDir;
var outputDir;
var imgDir;
var imageIndex = 0;
/**
 * 转为html
 * @param file
 */
var covertHTML = exports.covertHTML = function (file, outputPath, basename) {
    mammoth.convertToHtml({
        path: file
    }, {
        convertImage: mammoth.images.inline(function (element) {
            return element.read("base64").then(function (imageBuffer) {
                imageIndex++;
                var extname = element.contentType.replace('image/', '');
                var data = new Buffer(imageBuffer, 'base64');
                var imagePath = path.join(imgDir, basename, imageIndex + '.' + extname);
                fs.createWriteStream(imagePath).write(data);
                return {
                    src: imagePath
                };
            });
        })
    })
        .then(function (result) {
            var outputStream = outputPath ? fs.createWriteStream(outputPath) : process.stdout;
            outputStream.write(config.head + result.value + config.footer);
            fs.readFile(outputPath, 'utf8', function (err, data) {
                if (err) {
                    return console.log('readfile', err);
                }
                fs.writeFile(outputPath, beautify_html(data, {indent_size: 2}));
                console.log('[DONE] ', file);
            });
        });
};

module.exports = function (options) {
    options = options || {};
    config.fileDir = options.fileDir || config.fileDir;
    config.outputDir = options.outputDir || config.outputDir;
    config.head = options.head || config.head;
    config.footer = options.footer || config.footer;
    fileDir = path.join(__dirname, config.fileDir);
    outputDir = path.join(__dirname, config.outputDir);
    /**
     * 获取文件列表
     */
    glob.sync(fileDir + '/*.docx').forEach(function (file, index) {
        var basename = path.basename(file).split('.')[0];
        var outputPath = path.join(outputDir, basename + '.html');
        imgDir = path.join(outputDir, 'img');
        mkdir.sync(path.join(imgDir, basename));
        covertHTML(file, outputPath, basename);
    });
};
