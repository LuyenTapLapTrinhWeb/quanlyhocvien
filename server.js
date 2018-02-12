//import express
var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 6000;  

//middleware
app.use(express.static(path.join(__dirname, 'public')));

//var mysql = require('mysql');
var bodyParser = require('body-parser');


// app.use(require('./routes/truonghoc'));
// app.use(require('./routes/thanhvien'));
// app.use(require('./routes/quyen'));
// app.use(require('./routes/phanquyen'));
// app.use(require('./routes/khoahoc'));
// app.use(require('./routes/monhoc'));
// app.use(require('./routes/chuongtrinhhoc'));
// app.use(require('./routes/vnito'));
// app.use(require('./routes/students_status'));
// app.use(require('./routes/students_profile'));
// app.use(require('./routes/classroom'));
// app.use(require('./routes/class'));
// app.use(require('./routes/lecturer'));
// app.use(require('./routes/student'));
// app.use(require('./routes/cos'));

app.listen(port, () => { console.log("quan-ly-mon-phai", port) });
