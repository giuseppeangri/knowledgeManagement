var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var config = require('../config');

exports.upload = function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path;
        var file_size = files.file.size;
        var file_ext = files.file.name.split('.').pop();
        var index = old_path.lastIndexOf('/') + 1;
        var file_name = old_path.substr(index);
        var new_path = path.join(__dirname + '/../public/uploads', file_name + '.' + file_ext);
        
        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'error': 'problem with upload'});
                    } else {
                        res.status(200);
                        res.json({
                            'success': true,
                            'url': config.baseurl + 'uploads/' + file_name + '.' + file_ext});
                    }
                });
            });
        });
    });
};