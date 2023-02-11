const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
const Camps = require('./models/camps');
const User = require('./models/user');
const Post = require('./models/Posts');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
mongoose.set('strictQuery', true)
mongoose.connect('mongodb://localhost:27017/Camps', { useNewUrlParser: true, useUnifiedTopology: true , family : 4})
    .then(() => {
        console.log("CONNECTION OPENED");
    })
    .catch((err) => {
        console.log(" MONGO ERROR EROOR OCCURED!!");
        console.log(err);
    })

app.get('/flush',async (req, res) => {
    await Camps.deleteMany({});
})

app.get('/', (req, res) => {
    res.render('./Camps/homepage')
})

app.get('/camps', async (req, res) => {
    const allcamps = await Camps.find({});
    res.render('./Camps/Camps', { allcamps });
})

app.get('/camps/new', (req, res) => {
    res.render('./Camps/register');
})

app.post('/campregister',catchAsync(async(req, res) => {
    const newcamp = new Camps(req.body.User);
    await newcamp.save();
    res.redirect('/');
}))

app.get('/camps/:id', async (req, res) => {
    let { id } = req.params;
    const camp = await Camps.findById(id).populate("recentActivity");
    res.render('./Camps/ShowCamps', { camp });
})


//users

app.get('/users', async (req, res) => {
    const allusers = await User.find({});
    console.log(req.user)
    console.log(allusers);
     res.render('./Users/users', { allusers });
})

app.get('/users/new', (req, res) => {
    res.render('./Users/register');
})

app.post('/userregister', catchAsync(async (req, res) => {
    if (!req.body.User) {
        throw new ExpressError('Invalid Campground Data',400);
    }
    const newuser = new User(req.body.User);
    await newuser.save();
    res.redirect('/');
}));

app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render('./Users/Show', { user });
})



app.post('/camps/:id/post', async (req, res) => {
    const { id } = req.params;
    const camp = await Camps.findById(id);
    const { message } = req.body;
    const newpost = new Post();
    newpost.message = message;
    camp.recentActivity.push(newpost);
    await camp.save();
    await newpost.save();
    res.redirect(`/camps/${camp._id}`);
})


// postid/moneypaid
app.get('user/:id1/:id2/donate', async (req, res) => {
    const { id1, id2 } = req.params;
    console.log(`${id1},${id2}`);
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})


app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('./error',{err});
})



app.listen(8080, () => {
    console.log("Serving on the LocalHost 8080");
})