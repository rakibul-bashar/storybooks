const express =require('express');
const path =require('path');
const exphbs=require('express-handlebars');
const bodyParser=require('body-parser');
const methodOverride=require('method-override');
const mongoose=require('mongoose');
const passport=require('passport');
const cookieParser=require('cookie-parser');
const session=require('express-session');

//load user model
require('./models/user');
require('./models/stories');
//passport config
require('./config/passport')(passport);

const index=require('./routes/index');
const auth=require('./routes/auth');
const stories=require('./routes/stories');

const keys=require('./config/key');
const {
    truncate,
    stripTags,
    formatDate,
    select,
    editIcon
}=require('./helpers/hbs')


mongoose.Promise= global.Promise;
mongoose.connect(keys.mongoURI)
    .then(()=> console.log('MongoDB Connected'))
    .catch(err=>console.log(err));


const app=express();

app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())


app.engine('handlebars',exphbs({
    helpers:{
        truncate:truncate,
        stripTags:stripTags,
        formatDate:formatDate,
        select:select,
        editIcon:editIcon
    },
    defaultLayout:'main'
}));
app.set('view engine','handlebars');

app.use(cookieParser());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next)=>{
    res.locals.user=req.user || null;
    next();
});

app.use(express.static(path.join(__dirname,'public')));

app.use('/',index);
app.use('/auth',auth);
app.use('/stories',stories);

const port = process.env.PORT || 5000;

app.listen(port,()=> {

    console.log(`Server started on port... ${port}`)
})