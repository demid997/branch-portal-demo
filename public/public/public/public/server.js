const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_FILE);

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname,'public')));

const TOKENS = new Map();

app.post('/api/login', async (req,res)=>{
  const { username, password } = req.body;
  if(!username||!password) return res.status(400).json({error:'username & password required'});
  db.get('SELECT * FROM users WHERE username=?',[username], async (err,user)=>{
    if(err) return res.status(500).json({error:'server error'});
    if(!user) return res.status(401).json({error:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(401).json({error:'Invalid credentials'});
    const token = uuidv4();
    TOKENS.set(token,{userId:user.id,role:user.role,username:user.username});
    res.json({token,user:{id:user.id,username:user.username,role:user.role}});
  });
});

function requireAuth(req,res,next){
  const auth = req.headers['authorization'];
  if(!auth) return res.status(401).json({error:'No token'});
  const token = auth.replace('Bearer ','');
  const session = TOKENS.get(token);
  if(!session) return res.status(401).json({error:'Invalid token'});
  req.user=session;
  next();
}

app.get('/api/ping',requireAuth,(req,res)=>res.json({ok:true}));

app.listen(3000,()=>console.log('Смотродел DEMO running on http://localhost:3000'));
