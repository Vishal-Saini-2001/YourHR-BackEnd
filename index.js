const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Other routes


const dotenv = require('dotenv')
dotenv.config({path:'./config.env'});

const PORT = process.env.PORT;
const URI = process.env.URI;

// Connect to MongoDB Atlas
mongoose.connect(URI).then(console.log("MonGoDB Connected")).catch(err=>console.log(err));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+ '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

// Define a schema for user details
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  pdfFilePath: String,
});

const User = mongoose.model('User', userSchema);

// Route to handle file upload and user details
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const file = req.file;
    const pdfFilePath = file.path;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // console.log(name,email,file);

    const resp = await User.findOne({email});
    if(resp){
      return res.status(400).json({msg:"Email already exists"});
    }
    const newUser = new User({name,email,pdfFilePath});
    await newUser.save();
    return res.status(200).json("Registered Sucessfully");

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`);
})