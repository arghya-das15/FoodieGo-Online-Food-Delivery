const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const PORT=process.env.PORT||3000, ROOT=path.join(__dirname,".."), DATA=path.join(__dirname,"data","db.json");
const hash=x=>crypto.createHash("sha256").update(String(x)).digest("hex"), id=p=>p+"_"+crypto.randomBytes(5).toString("hex"), now=()=>new Date().toISOString();
if(!fs.existsSync(path.dirname(DATA)))fs.mkdirSync(path.dirname(DATA),{recursive:true});
let db={users:[],orders:[],tickets:[],notifications:[]};
try{const saved=JSON.parse(fs.readFileSync(DATA,"utf8"));if(saved&&typeof saved==="object")db={...db,...saved}}catch{}
if(!db.users.length){db.users=[
{id:"admin",name:"FoodieGo Admin",email:"admin@foodiego.com",password:hash("admin123"),role:"admin"},
{id:"owner",name:"Restaurant Owner",email:"owner@foodiego.com",password:hash("owner123"),role:"owner"},
{id:"delivery",name:"Delivery Partner",email:"delivery@foodiego.com",password:hash("delivery123"),role:"delivery"}];db.orders=[];db.tickets=[];db.notifications=[];save()}
const sessions=new Map();
function save(){fs.writeFileSync(DATA,JSON.stringify(db,null,2))}
function safe(u){const x={...u};delete x.password;return x}
function send(res,code,data,type="application/json"){res.writeHead(code,{"Content-Type":type,"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization","Access-Control-Allow-Methods":"GET,POST,PUT,OPTIONS"});res.end(type.startsWith("application/json")?JSON.stringify(data):data)}
function body(req){return new Promise((ok,bad)=>{let s="";req.on("data",c=>s+=c);req.on("end",()=>{try{ok(s?JSON.parse(s):{})}catch(e){bad(e)}})})}
function user(req){const t=(req.headers.authorization||"").replace(/^Bearer\s+/,"");return sessions.get(t)}
function need(req,res,roles=[]){const u=user(req);if(!u){send(res,401,{error:"Please login first"});return null}if(roles.length&&!roles.includes(u.role)){send(res,403,{error:"Permission denied"});return null}return u}
function order(o){return o}
function mime(p){return ({".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".json":"application/json"})[path.extname(p).toLowerCase()]||"application/octet-stream"}
const server=http.createServer(async(req,res)=>{
 if(req.method==="OPTIONS")return send(res,204,{});
 const u=new URL(req.url,"http://localhost"),p=u.pathname;
 try{
  if(p==="/api/health")return send(res,200,{ok:true});
  if(p==="/api/auth/signup"&&req.method==="POST"){const b=await body(req),email=String(b.email||"").trim().toLowerCase();if(!b.name||!email||!b.password||String(b.password).length<6)return send(res,400,{error:"Name, email and password (6+ characters) are required"});if(db.users.some(x=>x.email===email))return send(res,409,{error:"Email already registered"});const x={id:id("u"),name:b.name,email,phone:b.phone||"",password:hash(b.password),role:"customer",createdAt:now()};db.users.push(x);save();const t=id("token");sessions.set(t,x);return send(res,201,{user:safe(x),token:t})}
  if(p==="/api/auth/login"&&req.method==="POST"){const b=await body(req),email=String(b.email||"").trim().toLowerCase(),x=db.users.find(a=>a.email===email&&a.password===hash(b.password||""));if(!x)return send(res,401,{error:"Invalid email or password"});const t=id("token");sessions.set(t,x);return send(res,200,{user:safe(x),token:t})}
  if(p==="/api/me"){const x=need(req,res);if(x)return send(res,200,{user:safe(x)})}
  if(p==="/api/users"){const x=need(req,res,["admin"]);if(x)return send(res,200,db.users.map(safe))}
  if(p==="/api/orders"&&req.method==="POST"){const x=need(req,res);if(!x)return;const b=await body(req);if(!b.items?.length)return send(res,400,{error:"Cart is empty"});if(!b.address)return send(res,400,{error:"Delivery address is required"});const o={id:id("FG"),userId:x.id,items:b.items,subtotal:+b.subtotal||0,discount:+b.discount||0,delivery:+b.delivery||0,total:+b.total||0,address:b.address,phone:b.phone||"",paymentMethod:b.paymentMethod||"Cash on Delivery",paymentStatus:b.paymentMethod==="Cash on Delivery"?"Pending":"Payment Pending",status:"Order Confirmed",createdAt:now(),events:[{status:"Order Confirmed",note:"Order received",time:now()}]};db.orders.unshift(o);db.notifications.unshift({id:id("n"),userId:x.id,message:"Order "+o.id+" placed",read:false,time:now()});save();return send(res,201,o)}
  if(p==="/api/orders"&&req.method==="GET"){const x=need(req,res);if(!x)return;return send(res,200,x.role==="customer"?db.orders.filter(o=>o.userId===x.id):db.orders)}
  const om=p.match(/^\/api\/orders\/([^/]+)$/);if(om&&req.method==="GET"){const x=need(req,res);if(!x)return;const o=db.orders.find(a=>a.id===om[1]);if(!o)return send(res,404,{error:"Order not found"});if(x.role==="customer"&&o.userId!==x.id)return send(res,403,{error:"Forbidden"});return send(res,200,o)}
  const sm=p.match(/^\/api\/orders\/([^/]+)\/status$/);if(sm&&req.method==="PUT"){const x=need(req,res,["admin","owner","delivery"]);if(!x)return;const b=await body(req),o=db.orders.find(a=>a.id===sm[1]);if(!o)return send(res,404,{error:"Order not found"});o.status=b.status;o.events.push({status:b.status,note:b.note||"Status updated",time:now()});o.updatedAt=now();db.notifications.unshift({id:id("n"),userId:o.userId,message:"Order "+o.id+": "+o.status,read:false,time:now()});save();return send(res,200,o)}
  if(p==="/api/tickets"&&req.method==="POST"){const x=need(req,res);if(!x)return;const b=await body(req),t={id:id("T"),userId:x.id,message:b.message||"",type:b.type||"Support",status:"Open",createdAt:now()};db.tickets.unshift(t);save();return send(res,201,t)}
  if(p==="/api/tickets"&&req.method==="GET"){const x=need(req,res);if(!x)return;return send(res,200,x.role==="admin"?db.tickets:db.tickets.filter(t=>t.userId===x.id))}
  if(p==="/api/notifications"&&req.method==="GET"){const x=need(req,res);if(!x)return;return send(res,200,db.notifications.filter(n=>n.userId===x.id))}
  if(p==="/api/notifications/read-all"&&req.method==="POST"){const x=need(req,res);if(!x)return;db.notifications.filter(n=>n.userId===x.id).forEach(n=>n.read=true);save();return send(res,200,{ok:true})}
  if(p==="/api/admin/analytics"){const x=need(req,res,["admin"]);if(!x)return;const revenue=db.orders.filter(o=>o.paymentStatus==="Paid").reduce((a,o)=>a+o.total,0);return send(res,200,{users:db.users.length,orders:db.orders.length,revenue,averageOrderValue:db.orders.length?revenue/db.orders.length:0})}
  let f=p==="/"?"index.html":p.slice(1),fp=path.normalize(path.join(ROOT,f));if(!fp.startsWith(ROOT)||!fs.existsSync(fp))fp=path.join(ROOT,"index.html");send(res,200,fs.readFileSync(fp),mime(fp))
 }catch(e){console.error(e);send(res,500,{error:"Server error: "+e.message})}
});
server.listen(PORT,()=>console.log("FoodieGo running at http://localhost:"+PORT));
