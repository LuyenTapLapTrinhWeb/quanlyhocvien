var express = require('express');
var router = express.Router();
var multer = require('multer');
var crypto = require('crypto');
var path = require('path');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');

var storage = multer.diskStorage({
	destination: './public/images/avatar',
	filename: function (req, file, cb) {
		crypto.pseudoRandomBytes(16, function (err, raw) {
			if (err) return cb(err)
			cb(null, raw.toString('hex') + path.extname(file.originalname))
		})
	}
});

var upload = multer({ storage: storage });

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'iscdb'
});
connection.connect();
router.use(bodyParser.json());


//lay danh sach truong hoc
router.get('/student_status', function (req, res) {
	connection.query('SELECT * from student_status', function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			res.json(rows)
		}
	});
});

router.get('/list_university', function (req, res) {
	connection.query('SELECT * from university where status = 1', function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			res.json(rows)
		}
	});
});

router.get('/list_intake', function (req, res) {
	connection.query('SELECT * from intake where status = 1', function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			res.json(rows)
		}
	});
});

router.get('/student_profiles', function (req, res) {
	connection.query('SELECT * from student_profile where status_profile = 1', function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			res.json(rows)
		}
	});
});

router.get('/students_notin', function (req, res) {
	connection.query('SELECT u.user_code,u.firstname,u.lastname,u.gender,u.username from users u, decentralization d where u.status = 1 and u.user_code = d.user_code and d.access_id = 4 and u.user_code not in (select user_code from students)', function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			res.json(rows)
		}
	});
});

router.get('/students_in', function (req, res) {
	connection.query('SELECT u.firstname,u.lastname,u.phone,u.email, stu.id_stu, stu.code_stu,stu.major,sta.name_ss,uni.univer_name from users u, students stu, student_status sta, university uni where u.user_code = stu.user_code and stu.univer_code = uni.univer_code and stu.id_ss = sta.id_ss', function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			res.json(rows)
		}
	});
});

router.get('/getstudent/:code', function (req, res) {
	var student_info = {};
	var profile_info = {};
	var result = {
		student: {},
		profile: {}
	};
	var student_code = req.params.code;

	var sql = "select u.user_code,u.firstname,u.lastname,u.phone,u.email,u.gender, u.useraddress, u.username, stu.code_stu, stu.birthday,stu.major, stu.image, stu.univer_code,stu.id_ss,stu.int_code from users u, students stu where u.user_code = stu.user_code and stu.code_stu = '" + student_code + "'";
	connection.query(sql, function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			result.student = rows;
		}
	});

	sql = "select id_profile from profile_of_student where user_code in (select user_code from students where code_stu = '" + student_code + "')";
	connection.query(sql, function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			result.profile = rows;
		}
	});
	setTimeout(function () {
		res.json(result);
	}, 50);
});




// //xoa truong hoc
router.delete('/student/:id', function (req, res) {

	var id = req.params.id;
	var sql = "delete from profile_of_student where user_code in (select user_code from students where id_stu = '" + id + "')";
	connection.query(sql);
	sql = "delete from students where id_stu = '" + id + "'";

	connection.query(sql, function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
		}
		else {
			res.json(rows);
		}
	});

});


//them truong hoc
var urlImage = { "urlImage_name": "" };
var linkImage = { "link": "" };

router.post('/student_image', upload.any(), function (reqimg, resimg) {
	var str = (reqimg.files[0].path);
	var substr = str.substr(21, str.lenth);
	return linkImage.link = ("images/avatar/" + substr);
});
router.post('/student', function (req, res) {
	if (req.body.images == "rong") {
		urlImage.urlImage_name = "";

	} else {
		urlImage.urlImage_name = linkImage.link;
	}
	var fullyear = new Date().getFullYear() + '';
	//lay 2 so cuoi cua nam
	var year = fullyear.substring(2, 4);
	//lay ma khoa hoc
	var intake_code = req.body.intake;
	//lay ma gioi tinh
	var gender;
	if (req.body.gender == 1)
		gender = 0;
	else gender = 1;
	//lay so thu tu cua hoc vien trong khoa hoc
	var sql = 'select user_code from students where int_code = "' + intake_code + '"';

	connection.query(sql, function (err, rows, fields) {
		if (err) {
			connection.end();
			throw err;
			return 0;
		}
		else {
			var no = rows.length + 1 + '';
			switch (no.length) {
				case 1: no = '000' + no; break;
				case 2: no = '00' + no; break;
				case 3: no = '0' + no; break;
				case 4: break;
			}
			//noi chuoi de ra duoc ma hoc vien
			var student_code = intake_code + '-' + year + '-' + gender + '-' + no;

			var sql = "insert into students(code_stu,id_ss,image,int_code,major,univer_code,user_code,birthday)values('" + student_code + "','" + req.body.status_code + "','" + urlImage.urlImage_name + "','" + intake_code + "','" + req.body.major + "','" + req.body.univer_code + "','" + req.body.student + "','" + dateFormat(req.body.birthday, "yyyy/m/dd") + "')";

			connection.query(sql, function (err, rows1, fields) {
				if (err) {
					connection.end();
					throw err;
				}
				else {
					res.json(rows1);
				}
			});
			if (req.body.profiles.length >= 1) {
				for (var i = 0; i < req.body.profiles.length; i++) {
					var sql = "insert into profile_of_student(user_code,id_profile)values('" + req.body.student + "','" + req.body.profiles[i] + "')";
					connection.query(sql);
				}
			}
		}
	});
});



//sua truong hoc
var upload1 = multer({ storage: storage });

var urlImage_edit = { "urlImage_edit_thuoctinh": "" };

router.post('/student_image_edit', upload1.any(), function (reqimg1, resimg1) {

	var str1 = (reqimg1.files[0].path);
	var substr = str1.substr(21, str1.lenth);
	return urlImage_edit.urlImage_edit_thuoctinh = ("images/avatar/" + substr);



});

router.put('/student/:id', function (req, res) {


	var code_stu = req.params.id;
	var data_student = req.body.student;
	var data_profile = req.body.profile;

	if (urlImage_edit.urlImage_edit_thuoctinh == "") {
		urlImage_edit.urlImage_edit_thuoctinh = req.body.image;
	}

	var sql = "update students set birthday='" + dateFormat(data_student.birthday, "yyyy/m/dd") + "', major='" + data_student.major + "', image='" + urlImage_edit.urlImage_edit_thuoctinh + "', univer_code='" + data_student.univer_code + "',id_ss='" + data_student.id_ss + "',int_code='" + data_student.int_code + "' where code_stu = '" + code_stu + "'";

	connection.query(sql);

	sql = "delete from profile_of_student where user_code ='" + data_student.user_code + "'";
	connection.query(sql);

	for (var i = 0; i < data_profile.length; i++) {
		sql = "insert into profile_of_student(id_profile,user_code) values('" + data_profile[i] + "','" + data_student.user_code + "')";
		connection.query(sql);
	}

});

module.exports = router;