const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const Joi = require('joi');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const camproutes = require('./routers/camps');
const userroutes = require('./routers/users');


app.use(methodOverride('_method'))



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

const Camps = require('./models/camps');
const User = require('./models/user');
const Post = require('./models/Posts');
const { campsSchema, UserSchema } = require('./schemas');

const { isLoggedin } = require('./middleware');


const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { findByIdAndDelete } = require('./models/camps');
const Posts = require('./models/Posts');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());



mongoose.set('strictQuery', true)
mongoose.connect('mongodb://localhost:27017/Camps', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4
})
    .then(() => {
        console.log("CONNECTION OPENED");
    })
    .catch((err) => {
        console.log(" MONGO ERROR EROOR OCCURED!!");
        console.log(err);
    })


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/flush', async (req, res) => {
    await Camps.deleteMany({});
})

app.get('/login', (req, res) => {
    res.render('./Users/login');
})

app.get('/logout', (req, res) => {
    console.log(req.session);
    req.session.flash("success")= "Goodbye!!";
    res.redirect('/');
})

app.use('/camps', camproutes);
app.use('/users', userroutes);

app.get('/', (req, res) => {
    res.render('./homepage')
})


app.post('/:id/donate',isLoggedin, async(req, res) => {
    const { id } = req.params;
    let { money } = req.body;
    const post = await Post.findById(id);
    if (req.session && req.session.passport) {
        const user = await User.find({ username: req.session.passport.user });  
        console.log(user);
        post.user.push(user[0]);
        post.money.push(money);
        console.log(post);
        await post.save();
    }
    res.redirect(`/posts/${post._id}`);
})




app.get('/posts/:id', isLoggedin,async(req, res) => {
    let { id } = req.params;
    const post = await Posts.findById(id).populate("user").populate("sender");
    console.log(post);
    res.render('./Posts/Show', { post });
})





app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})


app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('./error', { err });
})



app.listen(8080, () => {
    console.log("Serving on the LocalHost 8080");
})