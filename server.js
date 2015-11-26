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
  res.status(202).json({ upload_id: 'iama-uploadid' })
  //res.status(500)
  //res.status(400).json({"successful": false, "errors": {"timestamp": ["Timestamp is expired."]}})
});

// form upload
app.post('/upload', function (req, res, next) {
  res.set('Content-Type', 'application/json');
  res.json({
    success: true,
    status_url: '/click-scan-complete/updown/myid'
  })
});

// upload signature
app.get('/dev/click-apps/upload-signature/', function (req, res, next) {
  res.set('Content-Type', 'application/json');
  res.json({
    timestamp: "1447966986.77",
    upload_id: "fac249cf-2965-4f39-8786-2d872da55614",
    signature: "0cdca618c6aa79cb264057e6f66eb300ffcb66fcf395aecf41e031282df41573"
  })
});

// package scan polling
app.get('/click-scan-complete/updown/myid', function (req, res, next) {
  res.set('Content-Type', 'application/json');
  res.json({
    success: false
  })
});

app.listen(3000);
