var express = require('express');
var mysql=require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookieParser');
var path = require('path');
var bcryptjs = require('bcryptjs');
var db = require('./db');	

var session = require('express-session');
var smtpTransport = require('nodemailer-smtp-transport');
var ejs  = require('ejs');

var app = new express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use(session({secret: 'ssshhhhh',resave: true, saveUninitialized: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/',function(req,res){
	var sess = req.session;
	if(!sess.email)
	{
	res.render('index',{title : 'Index',sessions:''});
	}
	else
	{
	res.render('index',{title : 'Index',sessions:sess.email});
	}
	
});

app.get('/about',function(req,res){
	var sess = req.session;
	if(!sess.email)
	{
	res.render('about',{title : 'About',sessions:''});
	}
	else
	{
		res.render('about',{title : 'About',sessions:sess.email});
	}
	
});

app.get('/contact',function(req,res){
	var sess = req.session;
	if(!sess.email)
	{
	res.render('contact',{title : 'Contact',sessions:''});
	}
	else
	{
		res.render('contact',{title : 'Contact',sessions:sess.email});
	}
	
});

app.get('/register',function(req,res){
		var sess = req.session;
		if(!sess.email)
		{
		res.render('register',{title : 'Registration Page',sessions:''});
		}
		else
		{
			res.render('index',{title : 'Index',sessions:sess.email});
		}
	
});

app.get('/login',function(req,res){
	var sess = req.session;
	if(!sess.email)
	{
	res.render('login',{title : 'Login',sessions:''});	}
	else
	{
	res.render('index',{title : 'Index' , sessions:sess.email});
	}
});

app.get('/logout',function(req,res){
	var sess = req.session;
	sess.email = '';
	res.render('index',{title:'Index',sessions:''});
});


// Registration form post


app.post('/formfill', function (req, res) {
    var email = req.body.email;
	var pwd = req.body.password;
	var hash = bcryptjs.hashSync(pwd, bcryptjs.genSaltSync(10));
	var row  = {password:hash, email:email,verified:'false'};
	var q = "SELECT * FROM users Where email = '"+email+"'";
	var count =0;var flashmsg='';
	// check if user exists
	db.query(q, function(err,rows, result) {
	//if (err) throw err;
	if(rows[0]!=null) {
	count = 1;
	console.log("User exists!");
	res.render('register',{title : 'User already exists!',sessions:''});
	}
	else{
		db.query('INSERT INTO users SET ?',row, function(err_in, row_in, result_in) {
			console.log("user "+row.email+" created");
			res.render('login',{title : 'Login page',sessions:''});
		});
	}
});
});

/*------------------Routing Started ------------------------*/
	

// Confirmation of email verification


// login form post

app.post('/login',function(req,res){
	var sess = req.session;
	var email = req.body.email;
	var pwd = req.body.password;
	var q = "Select * from users where email ='"+email+"'";
	var resultset="",verified='no';
	
	db.query(q, function(err,row,fields) {
	if (err) {throw err;}
	else if(row[0] == null) {
		console.log("No such username in db");
		res.render('login',{title:'No such username in db',sessions:''});
	}
	else if(row[0] != null)
	{
		resultset = row[0].password;
		verified = row[0].verified; 
		if(bcryptjs.compareSync(pwd,resultset))
		{
		//login code (set session)
			sess = req.session;
			sess.email = email;
			res.render('index',{title:'Index',sessions:sess.email});
			console.log("user logged in!");
		}
		else
		{
			console.log("Wrong username and password!");
			res.render('index',{title:'Wrong username and password',sessions:''});
		}
	}
		
	});
		
});

// Get request for the My repository page

app.get('/myrep',function(req,res){
	var sess = req.session;
	if(!sess.email){
		res.render('login',{title:'Login',sessions:''});
	}
	else{
		res.render('myrep',{title:'My Repository',sessions:sess.email});
	}
});

app.listen(3000,function(){
	console.log('Listening on port 3000');
});

