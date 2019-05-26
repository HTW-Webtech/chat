const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs'); // views sind vom typ "ejs"
app.set('views', __dirname + '/views'); // … und liegen im ordner "views"
app.use(express.static(__dirname + '/public')); // alles im ordner "public" soll direkt als datei ausgeliefert werden
app.use(cookieParser()); // cookies sollen vorberarbeitet werden
app.use(bodyParser.urlencoded({ extended: false })); // … und formularinhalte auch

// generiert eine zufällige zeichenkette
const generateToken = () =>
  Math.random()
    .toString(36)
    .substr(2);

// map aller benutzer und deren passwörter
const users = {
  max: 'moritz', // haha
};
// map aller sessions und deren user (anfänglich keine)
const sessions = {};
// liste aller nachrichten
const messages = [
  { user: 'Alice', date: 1558704463209, message: 'Hello Bob' },
  { user: 'Bob', date: 1558704563209, message: 'Hello Alice' },
];

// Express-Routen

app.get('/', (req, res) => {
  const user = sessions[req.cookies.session];
  if (!user) {
    res.redirect('/login');
  } else {
    res.render('chat', { user, messages });
  }
});

app.post('/', (req, res) => {
  const user = sessions[req.cookies.session];
  const date = Date.now();
  const { message } = req.body;
  messages.push({ user, date, message });
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { name, password } = req.body;
  users[name] = password;
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { name, password } = req.body;
  if (users[name] === password) {
    const session = generateToken();
    sessions[session] = name;
    res.cookie('session', session);
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});

app.listen(5000);
