const express = require('express');
const app = express();
const dotenv = require('dotenv')
const cors = require('cors')

const databaseConnect = require('./config/database')
const authRouter = require('./routes/authRoute')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const messengerRoute = require('./routes/messengerRoute');

dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/messenger', authRouter);
app.use('/api/messenger', messengerRoute);

const PORT = process.env.PORT || 5000
app.get('/', (req, res) => {
     res.send('This is from backend Sever')
})

databaseConnect().then(()=>{

     app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`)
     })

});