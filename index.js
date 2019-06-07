const { join } = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

app.set('view engine', 'ejs'); // views sind vom typ "ejs"
app.set('views', join(__dirname, '/views')); // … und liegen im ordner "views"
app.use(express.static(join(__dirname, '/public'))); // alles im ordner "public" soll direkt als datei ausgeliefert werden
app.use(helmet()); // gibt mehr sicherheit
app.use(cookieParser()); // cookies sollen vorberarbeitet werden
app.use(bodyParser.urlencoded({ extended: false })); // … und formularinhalte auch

const connection = mysql.createConnection({
  host: 'db.f4.htw-berlin.de',
  user: '<IHR NUTZER>',
  password: '<IHR PASSWORT>',
  database: '<IHRE DATENBANK>',
});

const getMessages = cb =>
  connection.query(
    'select messages.*, users.name from messages join users on users.id = messages.user',
    (err, result) => cb(result),
  );

const addMessage = (message, cb) =>
  connection.query('insert into messages set ?', message, cb);

const getUsers = cb =>
  connection.query('select * from users', (err, result) => cb(result));

const checkCredentials = (name, password, cb) =>
  connection.query(
    'select * from users where name = ? and password = ?',
    [name, password],
    (err, result) => cb(result[0]),
  );

const addUser = (user, cb) =>
  connection.query('insert into users set ?', user, cb);

// generiert eine zufällige zeichenkette
const generateToken = () =>
  Math.random()
    .toString(36)
    .substr(2);

// map aller sessions und deren user (anfänglich keine)
const sessions = {};

// Express-Routen

app.get('/', (req, res) => {
  const user = sessions[req.cookies.session];
  if (!user) {
    res.redirect('/login');
  } else {
    getMessages(messages => res.render('chat', { user, messages }));
  }
});

app.post('/', (req, res) => {
  const user = sessions[req.cookies.session];
  const { message } = req.body;
  addMessage({ user: user.id, content: message }, () => res.redirect('/'));
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { name, password } = req.body;
  addUser({ name, password }, () => res.redirect('/login'));
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { name, password } = req.body;
  checkCredentials(name, password, user => {
    if (user) {
      const session = generateToken();
      sessions[session] = user;
      res.cookie('session', session);
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
});

app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});

const port = process.env.PORT || 5000;

app.listen(port, err => {
  if (err) throw err;
  console.log(`Server is running on http://localhost:${port}`);
});
