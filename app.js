var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var urlencode = require('urlencode');
var url = require('url');

var config = require("./config")();
var conString = config.dbConStr;

var db = require('pg-bricks').configure(conString);
db.pg.defaults.poolSize = 20;

//var pg = require('pg');
//set connection pool size to 20
//pg.defaults.poolSize = 20;

var routes = require('./routes/index');
var html_dir = './static/';
var app = express();

var authFilter = function(req, res, next){
    var pathname = url.parse(req.url).pathname;
    console.log("Request for " + pathname + " received.");
    
    if(pathname && pathname.indexOf('wxoauth_callback') > -1){
        return next();
    }
    
    var openid = req.query.openid || req.cookies.openid;
    console.log("openid = " + openid);
    
    if(!openid){        
        return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" 
            + config.wxAppId + "&redirect_uri=" 
            + urlencode("http://campaign.canda.cn/wxoauth_callback?redirect=http://campaign.canda.cn/users")
            +"&response_type=code&scope=snsapi_userinfo&state=1234567890#wechat_redirect");
    }
    
    db.select().from('auth_users').where('openid', openid).rows(function(err, rows){
        if(err) {  
          console.error('error running query', err);
          next(err);
          return;
        }
                
        if(rows && rows[0] && rows[0].openid){
            next();
        }else{
            console.log("could not find any record associated with this openid");
            //else need redirect to weixin for auth
            return res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" 
                + config.wxAppId + "&redirect_uri=" 
                + urlencode("http://campaign.canda.cn/wxoauth_callback?redirect=http://campaign.canda.cn/users")
                +"&response_type=code&scope=snsapi_userinfo&state=1234567890#wechat_redirect");
        }
    });    
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
/*
app.use(bodyParser.urlencoded({ extended: false }));
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("MKGM-CA-CAMPAIGN-9588"));

/*

app.option("/iamalive", function(req, res, next){
    return res.json({
        success: true,
        message: 'iamalive'
    });    
});
*/

//app.use('/', routes);
app.use(express.static(path.join(__dirname, 'static')));

app.use(authFilter);
app.get('/', function(req, res) {
    res.sendfile(html_dir + 'home.html');
});




app.get('/wxoauth_callback', function(req, res, next){
     
    console.log("Callback request query: " + req.query);
    
    var accessTokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" 
        + config.wxAppId + "&secret=" + config.wxAppSecret 
        + "&code=" + req.query.code + "&grant_type=authorization_code";
    
    request.get(accessTokenUrl, function(err, response, bd){
        if(err){
            console.log("ERROR ocurred when request for access token : " + err);
            return next(err);
        }
        console.log("auth token response : " + JSON.stringify(bd));
        res.cookie('openid', '1234567890', { maxAge: 60 * 1000 });
        return res.redirect('/users');
    });
})

app.put('/users', function(req, res, next){
    var input = JSON.parse(JSON.stringify(req.body)); 
    console.log(input);
    
    res.json({
        success: true,
        mobile: input.mobile
    });
});



app.get('/users', function(req, res, next){
      
    /*
pg.connect(conString, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('SELECT mobile, name from user_reg', function(err, result) {
            //call `done()` to release the client back to the pool
            done();
            if(err) {
              return console.error('error running query', err);
            }
            console.log(result.rows[0].mobile);
            //output: 1
            var r = {
                mobile: result.rows[0].mobile,
                name: result.rows[0].name
            }
            res.json(r);
        });
    });
*/ 
    db.select().from('user_reg').where('mobile', '13764211365').rows(function(err, rows){
        if(err) {  
          console.error('error running query', err);
          next(err);
          return;
        }
        console.log(rows[0].mobile);
        var r = {
            mobile: rows[0].mobile,
            name: rows[0].name
        }
        //call message api to send sms
        var sms = config.smsNormal;
        sms = sms.replace("【变量1】", '50');
        sms = sms.replace("【变量2】", '55555555');
        /*
request.post({
                    url:'http://121.199.16.178/webservice/sms.php?method=Submit', 
                    form: { 
                        account: 'cf_obizsoft',
                        password: 'a123456',
                        mobile: '13764211365',
                        content: sms
                    }
                }, function(err, res, bd){
                    console.log(bd);
                }
        );
*/
        res.json(r);
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
