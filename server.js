var express = require('express');
var multer = require('multer');
var path = require('path');
var app = express();
var upload = multer({ dest: 'uploads/' })

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// in reality this is a CORS request with an additional OPTIONS preflight req
app.post('/unscanned-upload', upload.single('package'), function (req, res, next) {
  res.set('Content-Type', 'application/json');
  res.json({ upload_id: 'iama-uploadid' })
});

// form upload
app.post('/upload', function (req, res, next) {
  res.set('Content-Type', 'application/json');
  //res.status(500).json({ error: 'message' })
  res.json({
    success: true,
    status_url: '/click-scan-complete/updown/myid'
  })
});

// package scan polling
app.get('/click-scan-complete/updown/myid', function (req, res, next) {
  res.set('Content-Type', 'application/json');
  res.json({
    success: true
  })
});

app.listen(3000);
