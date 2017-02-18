var express = require('express');
var mysql=require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookieParser');
var path = require('path');
var bcryptjs = require('bcryptjs');
var db = require('./db');	
var nodemailer = require("nodemailer");
var session = require('express-session');
var ejs  = require('ejs');
//var router = express.Router;
var app = new express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');



//app.use('/api', api); // redirect API calls
//app.use('/', express.static(__dirname + '/www')); // redirect root
//app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
//app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
//app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use(session({secret: 'ssshhhhh',resave: true, saveUninitialized: true }));
//app.use(bodyParser.json());
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
	var row  = {password:hash, email:email};
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
			console.log("user"+row.email+" created");
			res.render('login',{title : 'Login page',sessions:''});
		});
	}
});
	/*if(count == 1)
	{
		console.log("user already exists");
		res.render('register',{flashmsg : 'User already present'});
	}
	//creating new record
	if(count == 0){
		db.query('INSERT INTO users SET ?', row, function(err, result) {
		if (err) throw err;
		else {
			console.log("user created");
			res.render('login',{title : 'Login page',sessions:''});
		}
	});
	}*/
	
});

// login form post

app.post('/login',function(req,res){
	var sess = req.session;
	var email = req.body.email;
	var pwd = req.body.password;
	var q = "Select password from users where email ='"+email+"'";
	var resultset="";
	console.log(pwd);
	db.query(q, function(err,row,fields) {
	if (err) {throw err;}
	else if(row[0] == null) {
		console.log("No such username in db");
	}
	else
	{
		resultset = row[0].password;
		if(bcryptjs.compareSync(pwd,resultset))
		{
		//login code (set session)
			sess = req.session;
			sess.email = email;
			res.render('index',{title:'Index',sessions:sess.email});
			console.log("user logged in!");
		}
	}	
	});
		
});


app.listen(3000,function(){
	console.log('Listening on port 3000');
});


/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "yourmail@service.com",
        pass: "xxx"
    }
});
var rand,mailOptions,host,link;
/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/


app.get('/send',function(req,res){
        rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    mailOptions={
        to : req.query.to,
        subject : "Please confirm your Email account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
        res.end("error");
     }else{
            console.log("Message sent: " + response.message);
			res.end("sent");
         }
});
});

app.get('/verify',function(req,res){
console.log(req.protocol+":/"+req.get('host'));
if((req.protocol+"://"+req.get('host'))==("http://"+host))
{
    console.log("Domain is matched. Information is from Authentic email");
    if(req.query.id==rand)
    {
        console.log("email is verified");
        res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
    }
    else
    {
        console.log("email is not verified");
        res.end("<h1>Bad Request</h1>");
    }
}
else
{
    res.end("<h1>Request is from unknown source");
}
});
