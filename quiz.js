var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
let port = 5001;
let question = require('./public/question.json');
let candidate_name;
let first_count = 0,second_count = 0,third_count = 0;

app.use(express.urlencoded());
app.set('question', question);
app.set('view engine','ejs');

mongoose.connect("mongodb://localhost/Candidate",{useNewUrlParser: true, useUnifiedTopology: true});

let candidate_schema = new mongoose.Schema({
  candidate_name : {
    type : String,
    required : true,
  },
  candidate_email :{
    type: String,
    required : true,
  }
});


let test_score_Schema = new mongoose.Schema({
  candidate_name : {
    type : String,
    required : true,
  },
  first_round : Number,
  second_round : Number,
  third_round : Number
});

let candidate_collection = new mongoose.model('candidate_data',candidate_schema);
let test_score = new mongoose.model('test_score',test_score_Schema);

app.get('/', (req,resp)=>{
    resp.render("register");
});
app.post('/', (req,resp)=>{
  const data = new candidate_collection({
      candidate_name : req.body.candidate_name,
      candidate_email :  req.body.candidate_email,
  });
  candidate_name = req.body.candidate_name;
    candidate_collection.insertMany([data]);
    console.log(candidate_name);
    resp.render("attemp_test.ejs");
});

app.get('/first_test', (req,resp) => {
    let data = req.app.get('question');
    resp.render("quiz.ejs",{ data : data.first_test });
    //console.log(data.questions);
});

app.get('/second_test', (req,resp) => {
    let data = req.app.get('question');
    resp.render("quiz.ejs",{ data : data.second_test });
    //console.log(data.questions);
});

app.get('/third_test', (req,resp) => {
    let data = req.app.get('question');
    resp.render("quiz.ejs",{ data : data.third_test });
    //console.log(data.questions);
});

app.post('/first_test', (req,resp) => {
    let data = req.app.get('question');
    let questions = data.first_test;
    questions.forEach(function(item){
      if(req.body[item.id] == item.answer){
      //  console.log("Your Answer is correct");
        first_count += 5;
      }
    });
    console.log("Marks scored : "+ first_count);
    console.log("candidate_name : "+candidate_name);
    resp.render("first_test.ejs");
});


app.post('/second_test', (req,resp) => {
    let data = req.app.get('question');
    let questions = data.second_test;
    questions.forEach(function(item){
      if(req.body[item.id] == item.answer){
      //  console.log("Your Answer is correct");
        second_count += 5;
      }
    });
    console.log("Marks scored : "+second_count);
    resp.render("second_test.ejs");
});


app.post('/third_test', (req,resp) => {
    let data = req.app.get('question');
    let questions = data.third_test;
    questions.forEach(function(item){
      if(req.body[item.id] == item.answer){
      //  console.log("Your Answer is correct");
        third_count += 5;
      }
    });
    const score = new test_score({

        candidate_name : candidate_name,
        first_round : first_count,
        second_round : second_count,
        third_round : third_count
    });
    test_score.insertMany([score]);
    console.log("Marks scored : "+third_count);
    console.log("candidate_name : "+candidate_name);
    resp.render("third_test.ejs");
});

app.get('/highest_score' , (req,resp) =>{
    test_score.find({}).sort({first_round:-1,second_round:-1,third_round:-1}).limit(1).then(function(data){
        resp.render('result',{candidate : data,title:"Highest Scoring Candidate"});
    });
});
app.get('/avg_score' , (req,resp) =>{
    test_score.find({}).sort({first_round:1,second_round:1,third_round:1}).then(function(data){
        resp.render('result',{candidate : data,title:"Average Scores per round for all Candidates"});
    });
});

app.listen(port,()=> {
  console.log("express is running on : "+port);
})
