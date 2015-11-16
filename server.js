var express = require('express');
var multer = require('multer');
var path = require('path');
var app = express();
var upload = multer({ dest: 'uploads/' })

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/updown', upload.single('package'), function (req, res, next) {
  res.set('Content-Type', 'application/json');
  res.json({ upload_id: 'iama-uploadid' })
  res.status(204).end();
});

app.listen(3000);
