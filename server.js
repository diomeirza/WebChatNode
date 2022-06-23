var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var dbUrl = 'mongodb+srv://user:user@cluster0.feeev.mongodb.net/Webchat?retryWrites=true'

var Message = mongoose.model('Message', {
    name: String,
    message: String
})


app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})

app.post('/messages', async (req, res) => {
    try {
        var message = new Message(req.body);

        var savedMessage = await message.save();
        console.log('data is saved');

        var censored = await Message.findOne({ message: 'badword' });
        if (censored)
            await Message.deleteOne({ _id: censored.id });
        else
            io.emit('message', req.body);

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        console.log(error);
    }
})


io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, (err) => {
    console.log('mongo db connection', err)
})

var server = http.listen(3000, () => {
    console.log('app is listening on port ', server.address().port);
})
