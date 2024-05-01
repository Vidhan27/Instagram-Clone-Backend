const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const port = 3000;

const User = require('./router/user');
const Post = require('./router/post');

const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => console.log(err));



app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Production running fine");
});


app.use("/api/user",User);
app.use("/api/post",Post);


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);  
})
