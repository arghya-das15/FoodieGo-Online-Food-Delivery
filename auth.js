
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./db");
const SECRET = process.env.JWT_SECRET || "foodiego-dev-secret";

function signUser(user) {
  return jwt.sign({ id:user.id, role:user.role, email:user.email }, SECRET, { expiresIn:"7d" });
}
function safeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}
function auth(requiredRoles=[]) {
  return (req,res,next)=>{
    try {
      const token = (req.headers.authorization || "").replace(/^Bearer\s+/,"");
      if(!token) return res.status(401).json({error:"Authentication required"});
      const payload = jwt.verify(token, SECRET);
      const user = db.prepare("SELECT id,name,email,phone,role,created_at FROM users WHERE id=?").get(payload.id);
      if(!user) return res.status(401).json({error:"User not found"});
      if(requiredRoles.length && !requiredRoles.includes(user.role)) return res.status(403).json({error:"Insufficient permission"});
      req.user=user; next();
    } catch(e) { return res.status(401).json({error:"Invalid or expired token"}); }
  };
}
async function createUser({name,email,phone,password,role="customer"}) {
  const password_hash = await bcrypt.hash(password, 12);
  const info = db.prepare("INSERT INTO users(name,email,phone,password_hash,role) VALUES(?,?,?,?,?)")
    .run(name,email.toLowerCase(),phone||"",password_hash,role);
  return db.prepare("SELECT id,name,email,phone,role,created_at FROM users WHERE id=?").get(info.lastInsertRowid);
}
module.exports = { SECRET, signUser, safeUser, auth, createUser, bcrypt };
