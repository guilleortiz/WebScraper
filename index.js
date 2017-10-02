var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var schedule = require('node-schedule');
var nodemailer = require('nodemailer');

var provincia="cordoba";//set the province you want to know when and where

//heroku ps:scale worker=0 stop worker
//heroku ps:scale worker=1 start worker


console.log('Waiting for schedule job to trigger...')

/*

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)

*/
var j = schedule.scheduleJob('0 0 21 * * *', function(){
  console.log('schedule job started...');
  scrape(provincia);
});

function scrape (provincia){
   
    console.log('Scraping...');
    var url = "https://events.withgoogle.com/GoogleporArgentina/";
    url+=provincia+"/#content";

    request(url, function(error, response, html){

        
        if(!error){
            //  cheerio library to returned html , jQuery functionality

            var $ = cheerio.load(html);
            var title;

        	//jquery function like to get data from that class where the data will be
        	$('.dj-when-where').filter(function(){

                var data = $(this);

                title = data.children().text();

            })
        		if (title!=null) {
        			sendMail(title);
        			
        		}else {
        			console.log('Not date yet');
        			
        		}
        	
        }
    })
}

function sendMail(message){

	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
	    user: '***********',
	    pass: '***********'
	  }
	});

	var mailOptions = {
	  from: '***********',
	  to: '***********',
	  subject: 'News from',
	  text: message
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	  } else {
	    console.log('Email sent: ' + info.response);
	  }
	});

}

exports = module.exports = app;