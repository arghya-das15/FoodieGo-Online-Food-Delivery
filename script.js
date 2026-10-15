const foods = [
{id:1,name:"Royal Chicken Biryani",restaurant:"Spice Route",category:"Indian",price:329,rating:4.9,emoji:"🍛",veg:false,description:"Aromatic basmati rice with tender chicken."},
{id:2,name:"Truffle Margherita",restaurant:"Urban Slice",category:"Pizza",price:349,rating:4.9,emoji:"🍕",veg:true,description:"Mozzarella, basil and delicious truffle oil."},
{id:3,name:"Smoky Chicken Burger",restaurant:"Burger Lab",category:"Burger",price:279,rating:4.8,emoji:"🍔",veg:false,description:"Grilled chicken with cheddar and smoky sauce."},
{id:4,name:"Schezwan Noodles",restaurant:"Wok Street",category:"Chinese",price:219,rating:4.7,emoji:"🍜",veg:true,description:"Wok tossed noodles with fresh vegetables."},
{id:5,name:"Paneer Tikka Bowl",restaurant:"Spice Route",category:"Indian",price:259,rating:4.8,emoji:"🥘",veg:true,description:"Tandoori paneer with rice and mint chutney."},
{id:6,name:"Loaded Fries",restaurant:"Burger Lab",category:"Burger",price:149,rating:4.6,emoji:"🍟",veg:true,description:"Crispy fries with cheese and herbs."},
{id:7,name:"Belgian Chocolate Cake",restaurant:"Sweet Cravings",category:"Dessert",price:199,rating:4.9,emoji:"🍰",veg:true,description:"Rich chocolate sponge with creamy ganache."},
{id:8,name:"Farmhouse Pizza",restaurant:"Urban Slice",category:"Pizza",price:399,rating:4.8,emoji:"🍕",veg:true,description:"Fresh vegetables with mozzarella cheese."},
{id:9,name:"Strawberry Cheesecake",restaurant:"Sweet Cravings",category:"Dessert",price:229,rating:4.8,emoji:"🍓",veg:true,description:"Creamy cheesecake with strawberry topping."},
{id:10,name:"Butter Chicken",restaurant:"Spice Route",category:"Indian",price:289,rating:4.8,emoji:"🍲",veg:false,description:"Creamy tomato gravy with tender chicken."}
];

let cart = JSON.parse(localStorage.getItem("foodieCart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("foodieWishlist") || "[]");
let orders = JSON.parse(localStorage.getItem("foodieOrders") || "[]");
let currentCategory = "All";
let appliedCoupon = "";
let deliveryAddress = localStorage.getItem("foodieAddress") || "";

function save(){localStorage.setItem("foodieCart",JSON.stringify(cart));localStorage.setItem("foodieWishlist",JSON.stringify(wishlist));localStorage.setItem("foodieOrders",JSON.stringify(orders));}
function displayFoods(list=foods){
    const grid=document.getElementById("foodGrid"); grid.innerHTML="";
    if(!list.length){grid.innerHTML='<div class="empty-box" style="grid-column:1/-1">No dishes found. Try another search or filter.</div>';return;}
    list.forEach(food=>grid.appendChild(foodCard(food)));
}
function foodCard(food){
    const card=document.createElement("div"); card.className="food-card";
    const wished=wishlist.includes(food.id);
    card.innerHTML=`<div class="food-image">${food.emoji}
        <button class="heart" onclick="toggleWishlist(${food.id})">${wished?"♥":"♡"}</button>
        </div><div class="food-content"><h3>${food.name}</h3>
        <p class="food-description">${food.restaurant}<br>${food.description}</p>
        <div class="food-row"><span class="rating">⭐ ${food.rating}</span><span class="price">₹${food.price}</span></div>
        <div class="food-row"><small>${food.veg?"🟢 Veg":"🔴 Non-Veg"} · ${food.category} · 30 min</small>
        <button class="add-btn" onclick="addToCart(${food.id})">+ Add</button></div></div>`;
    return card;
}
function addToCart(id){const food=foods.find(f=>f.id===id);const item=cart.find(i=>i.id===id);item?item.quantity++:cart.push({...food,quantity:1});save();updateCart();showToast(food.name+" added to cart 🛒");}
function updateCart(){
    const box=document.getElementById("cartItems");box.innerHTML="";let subtotal=0,totalItems=0;
    cart.forEach(item=>{subtotal+=item.price*item.quantity;totalItems+=item.quantity;const d=document.createElement("div");d.className="cart-item";d.innerHTML=`<div><strong>${item.emoji} ${item.name}</strong><div class="quantity"><button onclick="changeQuantity(${item.id},-1)">−</button>${item.quantity}<button onclick="changeQuantity(${item.id},1)">+</button></div></div><strong>₹${item.price*item.quantity}</strong>`;box.appendChild(d);});
    if(!cart.length)box.innerHTML='<div class="empty-box">Your cart is empty 🛒</div>';
    const discount=appliedCoupon==="FOOD20"?Math.round(subtotal*.20):appliedCoupon==="FIRST50"?Math.min(50,subtotal):0;
    document.getElementById("cartCount").innerText=totalItems;document.getElementById("subtotal").innerText=subtotal;document.getElementById("discount").innerText=discount;document.getElementById("delivery").innerText=subtotal>=499?0:40;document.getElementById("total").innerText=Math.max(0,subtotal-discount+(subtotal>=499?0:40));
}
function changeQuantity(id,change){const item=cart.find(i=>i.id===id);if(!item)return;item.quantity+=change;if(item.quantity<=0)cart=cart.filter(i=>i.id!==id);save();updateCart();}
function openCart(){document.getElementById("cartPanel").classList.add("active");document.getElementById("overlay").classList.add("active");updateCart();}
function closeCart(){document.getElementById("cartPanel").classList.remove("active");document.getElementById("overlay").classList.remove("active");}
function searchFood(){const q=document.getElementById("searchInput").value.toLowerCase();const filtered=foods.filter(f=>(f.name+" "+f.restaurant+" "+f.category).toLowerCase().includes(q));displayFoods(filtered);document.getElementById("menu").scrollIntoView({behavior:"smooth"});}
function filterCategory(category){currentCategory=category;const list=category==="All"?foods:foods.filter(f=>f.category===category);displayFoods(list);document.getElementById("menu").scrollIntoView({behavior:"smooth"});}
function sortFood(){let list=[...foods];const v=document.getElementById("sortSelect").value;if(v==="low")list.sort((a,b)=>a.price-b.price);if(v==="high")list.sort((a,b)=>b.price-a.price);if(v==="rating")list.sort((a,b)=>b.rating-a.rating);displayFoods(list);}
function applyFilters(){let list=currentCategory==="All"?[...foods]:foods.filter(f=>f.category===currentCategory);const q=document.getElementById("searchInput").value.toLowerCase();const max=Number(document.getElementById("maxPrice").value)||999999;if(q)list=list.filter(f=>(f.name+" "+f.restaurant+" "+f.category).toLowerCase().includes(q));if(document.getElementById("vegOnly").checked)list=list.filter(f=>f.veg);list=list.filter(f=>f.price<=max);displayFoods(list);}
function clearFilters(){document.getElementById("vegOnly").checked=false;document.getElementById("maxPrice").value=500;document.getElementById("searchInput").value="";currentCategory="All";displayFoods();showToast("Filters cleared");}
function toggleWishlist(id){wishlist.includes(id)?wishlist=wishlist.filter(x=>x!==id):wishlist.push(id);save();displayFoods();renderWishlist();showToast(wishlist.includes(id)?"Added to wishlist ❤️":"Removed from wishlist");}
function renderWishlist(){const grid=document.getElementById("wishlistGrid"),empty=document.getElementById("emptyWishlist");grid.innerHTML="";wishlist.map(id=>foods.find(f=>f.id===id)).filter(Boolean).forEach(f=>grid.appendChild(foodCard(f)));empty.style.display=wishlist.length?"none":"block";document.getElementById("wishlistCount").innerText=wishlist.length+" item"+(wishlist.length===1?"":"s");}
function copyCoupon(){navigator.clipboard?.writeText("FOOD20");document.getElementById("couponInput").value="FOOD20";showToast("Coupon FOOD20 copied 🎟️");}
function applyCoupon(){const code=document.getElementById("couponInput").value.trim().toUpperCase();if(["FOOD20","FIRST50"].includes(code)){appliedCoupon=code;updateCart();showToast(code+" applied successfully 🎉")}else showToast("Invalid coupon code");}
function openAddress(){showModal(`<button class="close" onclick="closeModal()">×</button><h2>📍 Delivery Address</h2><p>Add the address where you want your food delivered.</p><input id="addressInput" placeholder="House / Flat, Street, Area" value="${deliveryAddress}"><input id="cityInput" placeholder="City" value="Kolkata"><button class="primary-btn" onclick="saveAddress()">Save Address</button>`);}
function saveAddress(){const a=document.getElementById("addressInput").value.trim();if(!a){showToast("Please enter an address");return;}deliveryAddress=a+", "+document.getElementById("cityInput").value;localStorage.setItem("foodieAddress",deliveryAddress);document.getElementById("currentAddress").innerText=deliveryAddress;closeModal();showToast("Delivery address saved 📍");}
function openCheckout(){if(!cart.length){showToast("Your cart is empty!");return}const subtotal=cart.reduce((s,i)=>s+i.price*i.quantity,0),discount=appliedCoupon==="FOOD20"?Math.round(subtotal*.2):appliedCoupon==="FIRST50"?Math.min(50,subtotal):0,total=subtotal-discount+(subtotal>=499?0:40);showModal(`<button class="close" onclick="closeModal()">×</button><h2>Checkout 💳</h2><p>Complete your order details.</p><input id="customerName" placeholder="Full name"><input id="phone" placeholder="Phone number"><textarea id="checkoutAddress" rows="3" placeholder="Delivery address">${deliveryAddress}</textarea><select id="payment"><option>UPI</option><option>Credit / Debit Card</option><option>Cash on Delivery</option></select><div class="checkout-summary"><b>Order Total: ₹${total}</b><p>Discount: ₹${discount} · Delivery: ₹${subtotal>=499?0:40}</p></div><button class="primary-btn" onclick="placeOrder()">Place Order</button>`);}
async function placeOrder(){const name=document.getElementById("customerName")?.value.trim(),phone=document.getElementById("phone")?.value.trim(),address=document.getElementById("checkoutAddress")?.value||deliveryAddress;if(!name||!phone){showToast("Please enter name and phone");return}const subtotal=cart.reduce((s,i)=>s+i.price*i.quantity,0),discount=appliedCoupon==="FOOD20"?Math.round(subtotal*.2):appliedCoupon==="FIRST50"?Math.min(50,subtotal):0,total=subtotal-discount+(subtotal>=499?0:40),payment=document.getElementById("payment")?.value||"Cash on Delivery";if(foodieToken){try{const o=await createBackendOrder({customerName:name,phone,address,items:cart,subtotal,discount,delivery:subtotal>=499?0:40,total,paymentMethod:payment});if(payment!=="Cash on Delivery"){showToast("Order created. Payment gateway ready for Razorpay.");}else showToast("Order "+o.public_id+" placed successfully 🎉");cart=[];appliedCoupon="";save();updateCart();closeModal();await syncOrdersFromBackend();setTimeout(()=>trackOrderLive(o.public_id),400);return}catch(e){showToast(e.message+" — using demo mode");}}const id="FG"+Date.now().toString().slice(-6);orders.unshift({id,date:new Date().toLocaleString(),items:cart.map(i=>({name:i.name,quantity:i.quantity})),total,status:"Order Confirmed",address});cart=[];appliedCoupon="";save();updateCart();closeModal();renderOrders();showToast("Order "+id+" placed successfully 🎉");setTimeout(()=>trackOrder(id),500);}
function renderOrders(){const box=document.getElementById("ordersList");box.innerHTML="";if(!orders.length){box.innerHTML='<div class="empty-box">No orders yet. Your completed orders will appear here.</div>';return}orders.slice(0,8).forEach(o=>{const d=document.createElement("div");d.className="order-card";d.innerHTML=`<div class="order-top"><div><strong>Order #${o.id}</strong><small> · ${o.date}</small></div><span class="status">${o.status}</span></div><div class="order-items">${o.items.map(i=>i.name+" × "+i.quantity).join(" · ")}</div><div class="order-actions"><span class="pill">₹${o.total}</span><button class="outline-btn" onclick="trackOrder('${o.id}')">Track Order</button><button class="outline-btn" onclick="reviewOrder('${o.id}')">Rate & Review</button><button class="outline-btn" onclick="reorder('${o.id}')">Re-order</button></div>`;box.appendChild(d);});}
function trackOrder(id){const o=orders.find(x=>x.id===id);if(!o){showToast("No order found");return}showModal(`<button class="close" onclick="closeModal()">×</button><h2>📦 Track Order #${o.id}</h2><p>Estimated delivery: <b>25–35 min</b></p><div class="tracking"><div class="track-step done"><span class="track-dot">✓</span><div><b>Order Confirmed</b><p>Restaurant received your order.</p></div></div><div class="track-step done"><span class="track-dot">✓</span><div><b>Preparing Food</b><p>Your meal is being prepared.</p></div></div><div class="track-step"><span class="track-dot">3</span><div><b>Out for Delivery</b><p>Delivery partner will pick it up soon.</p></div></div><div class="track-step"><span class="track-dot">4</span><div><b>Delivered</b><p>Enjoy your meal! 🍴</p></div></div></div><button class="primary-btn" onclick="closeModal()">Close</button>`);}
function reviewOrder(id){showModal(`<button class="close" onclick="closeModal()">×</button><h2>⭐ Rate your order</h2><p>How was your FoodieGo experience?</p><div class="review-stars">☆ ☆ ☆ ☆ ☆</div><textarea id="reviewText" rows="4" placeholder="Write a short review..."></textarea><button class="primary-btn" onclick="closeModal();showToast('Thanks for your review! ⭐')">Submit Review</button>`);}
function reorder(id){const o=orders.find(x=>x.id===id);if(!o)return;o.items.forEach(saved=>{const f=foods.find(x=>x.name===saved.name);if(f){const existing=cart.find(x=>x.id===f.id);existing?existing.quantity+=saved.quantity:cart.push({...f,quantity:saved.quantity})}});save();updateCart();openCart();showToast("Items added to cart 🛒");}
function openRestaurant(name,type,rating,time,emoji){showModal(`<button class="close" onclick="closeModal()">×</button><div style="font-size:70px;text-align:center">${emoji}</div><h2>${name}</h2><p>${type}</p><p>⭐ <b>${rating}</b> · 🚴 ${time}</p><div class="checkout-summary"><b>About this restaurant</b><p>Freshly prepared food, trusted service and quick delivery through FoodieGo.</p></div><button class="primary-btn" onclick="closeModal();document.getElementById('menu').scrollIntoView({behavior:'smooth'});showToast('Browse dishes from '+name)">Browse Menu</button>`);}
function openProfile(){showModal(`<button class="close" onclick="closeModal()">×</button><h2>👤 My Profile</h2><input id="profileName" placeholder="Your name" value="${localStorage.getItem("foodieName")||""}"><input id="profileEmail" type="email" placeholder="Email" value="${localStorage.getItem("foodieEmail")||""}"><input id="profilePhone" placeholder="Phone" value="${localStorage.getItem("foodiePhone")||""}"><button class="primary-btn" onclick="saveProfile()">Save Profile</button><hr style="margin:20px 0"><button class="outline-btn" onclick="closeModal();document.getElementById('orders').scrollIntoView({behavior:'smooth'})">📦 View Order History</button>`);}
function saveProfile(){localStorage.setItem("foodieName",document.getElementById("profileName").value);localStorage.setItem("foodieEmail",document.getElementById("profileEmail").value);localStorage.setItem("foodiePhone",document.getElementById("profilePhone").value);closeModal();showToast("Profile saved 👤");}
function toggleDarkMode(){document.body.classList.toggle("dark");localStorage.setItem("foodieDark",document.body.classList.contains("dark"));}
function showModal(html){document.getElementById("modalContent").innerHTML=html;document.getElementById("modal").classList.add("active");}
function closeModal(){document.getElementById("modal").classList.remove("active");}
function showToast(message){const toast=document.getElementById("toast");toast.innerText=message;toast.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2200);}
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal();});
if(localStorage.getItem("foodieDark")==="true")document.body.classList.add("dark");
if(deliveryAddress)document.getElementById("currentAddress").innerText=deliveryAddress;
displayFoods();renderWishlist();updateCart();renderOrders();

/* ================= V2: AUTH, ADMIN & RESTAURANT OWNER ================= */

let users = JSON.parse(localStorage.getItem("foodieUsers") || "[]");
let currentUser = JSON.parse(localStorage.getItem("foodieCurrentUser") || "null");
let restaurantMenu = JSON.parse(localStorage.getItem("foodieRestaurantMenu") || "[]");
let supportTickets = JSON.parse(localStorage.getItem("foodieSupportTickets") || "[]");

function saveV2(){
    localStorage.setItem("foodieUsers",JSON.stringify(users));
    localStorage.setItem("foodieCurrentUser",JSON.stringify(currentUser));
    localStorage.setItem("foodieRestaurantMenu",JSON.stringify(restaurantMenu));
    localStorage.setItem("foodieSupportTickets",JSON.stringify(supportTickets));
}

function openAuth(){
    showDashboard(`
      <div class="dashboard-head"><div><h2>🔐 FoodieGo Account</h2><p>Login or create a new demo account.</p></div><button class="dashboard-close" onclick="closeDashboard()">×</button></div>
      <div class="dashboard-tabs">
        <button onclick="showLoginForm()">Login</button>
        <button onclick="showSignupForm()">Create Account</button>
        <button onclick="showOwnerLogin()">Restaurant Owner</button>
      </div>
      <div id="authForm"></div>`);
    showLoginForm();
}

function showLoginForm(){
    document.getElementById("authForm").innerHTML=`
      <input id="authEmail" type="email" placeholder="Email">
      <input id="authPassword" type="password" placeholder="Password">
      <button class="primary-btn" onclick="loginUser()">Login</button>
      <p style="margin-top:12px">Demo admin: <b>admin@foodiego.com</b> / <b>admin123</b></p>`;
}
function showSignupForm(){
    document.getElementById("authForm").innerHTML=`
      <input id="authName" placeholder="Full name">
      <input id="authEmail" type="email" placeholder="Email">
      <input id="authPassword" type="password" placeholder="Password">
      <input id="authPhone" placeholder="Phone number">
      <button class="primary-btn" onclick="signupUser()">Create Account</button>`;
}
function showOwnerLogin(){
    document.getElementById("authForm").innerHTML=`
      <input id="ownerEmail" type="email" placeholder="Owner email">
      <input id="ownerPassword" type="password" placeholder="Password">
      <button class="primary-btn" onclick="ownerLogin()">Open Owner Panel</button>
      <p style="margin-top:12px">Demo owner: <b>owner@foodiego.com</b> / <b>owner123</b></p>`;
}
function signupUser(){
    const name=document.getElementById("authName").value.trim(),email=document.getElementById("authEmail").value.trim().toLowerCase(),password=document.getElementById("authPassword").value,phone=document.getElementById("authPhone").value.trim();
    if(!name||!email||!password){showToast("Please complete all required fields");return}
    if(users.some(u=>u.email===email)){showToast("Account already exists");return}
    users.push({name,email,password,phone,role:"customer"});saveV2();currentUser=users[users.length-1];saveV2();closeDashboard();showToast("Account created successfully 🎉");
}
function loginUser(){
    const email=document.getElementById("authEmail").value.trim().toLowerCase(),password=document.getElementById("authPassword").value;
    if(email==="admin@foodiego.com"&&password==="admin123"){closeDashboard();openAdmin();return}
    const u=users.find(x=>x.email===email&&x.password===password);
    if(!u){showToast("Invalid email or password");return}
    currentUser=u;saveV2();closeDashboard();showToast("Welcome back, "+u.name+" 👋");
}
function ownerLogin(){
    const email=document.getElementById("ownerEmail").value.trim().toLowerCase(),password=document.getElementById("ownerPassword").value;
    if(email!=="owner@foodiego.com"||password!=="owner123"){showToast("Invalid owner credentials");return}
    currentUser={name:"Restaurant Owner",email,role:"owner"};saveV2();closeDashboard();openOwnerDashboard();
}

function openAdmin(){
    showDashboard(`
      <div class="dashboard-head"><div><h2>⚙️ Admin Dashboard</h2><p>FoodieGo management center</p></div><button class="dashboard-close" onclick="closeDashboard()">×</button></div>
      <div class="dashboard-grid">
        <div class="dash-stat">👥 Users<b>${users.length+1}</b></div>
        <div class="dash-stat">📦 Orders<b>${orders.length}</b></div>
        <div class="dash-stat">🍽️ Dishes<b>${foods.length}</b></div>
        <div class="dash-stat">🎫 Tickets<b>${supportTickets.length}</b></div>
      </div>
      <div class="admin-actions">
        <button class="outline-btn" onclick="adminUsers()">👥 Manage Users</button>
        <button class="outline-btn" onclick="adminOrders()">📦 Manage Orders</button>
        <button class="outline-btn" onclick="adminMenu()">🍽️ Manage Menu</button>
        <button class="outline-btn" onclick="adminAnalytics()">📊 Analytics</button>
        <button class="outline-btn" onclick="adminTickets()">🎫 Support Tickets</button>
      </div>
      <div id="adminPanel"><div class="checkout-summary"><b>Quick overview</b><p>Use the buttons above to manage FoodieGo data. This is a front-end college-project dashboard using local storage.</p></div></div>`);
}
function adminUsers(){
    const rows=users.length?users.map((u,i)=>`<tr><td>${i+1}</td><td>${u.name}</td><td>${u.email}</td><td>${u.phone||"-"}</td><td>${u.role}</td></tr>`).join(""):`<tr><td colspan="5">No registered users yet.</td></tr>`;
    document.getElementById("adminPanel").innerHTML=`<h3>Users</h3><table class="dash-table"><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr>${rows}</table>`;
}
function adminOrders(){
    const rows=orders.length?orders.map(o=>`<tr><td>#${o.id}</td><td>${o.items.map(i=>i.name+" ×"+i.quantity).join(", ")}</td><td>₹${o.total}</td><td>${o.status}</td><td><button class="outline-btn" onclick="trackOrder('${o.id}')">Track</button></td></tr>`).join(""):`<tr><td colspan="5">No orders yet.</td></tr>`;
    document.getElementById("adminPanel").innerHTML=`<h3>Orders</h3><table class="dash-table"><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr>${rows}</table>`;
}
function adminMenu(){
    document.getElementById("adminPanel").innerHTML=`<h3>Menu Management</h3><p class="subtitle">Demo controls for the menu catalogue.</p><button class="primary-btn" onclick="showToast('Add Food form is ready for backend integration 🍴')">+ Add New Food</button><div style="margin-top:15px"><table class="dash-table"><tr><th>Dish</th><th>Category</th><th>Price</th><th>Rating</th></tr>${foods.map(f=>`<tr><td>${f.emoji} ${f.name}</td><td>${f.category}</td><td>₹${f.price}</td><td>⭐ ${f.rating}</td></tr>`).join("")}</table></div>`;
}
function adminAnalytics(){
    const revenue=orders.reduce((s,o)=>s+o.total,0),avg=orders.length?Math.round(revenue/orders.length):0;
    document.getElementById("adminPanel").innerHTML=`<div class="dashboard-grid"><div class="dash-stat">💰 Revenue<b>₹${revenue}</b></div><div class="dash-stat">🧾 Avg Order<b>₹${avg}</b></div><div class="dash-stat">❤️ Wishlist<b>${wishlist.length}</b></div><div class="dash-stat">🏪 Restaurants<b>4</b></div></div><div class="checkout-summary"><b>Project Analytics</b><p>Orders: ${orders.length} · Registered users: ${users.length} · Menu items: ${foods.length} · Support tickets: ${supportTickets.length}</p></div>`;
}
function adminTickets(){
    const rows=supportTickets.length?supportTickets.map(t=>`<tr><td>${t.type}</td><td>${t.message}</td><td>${t.status}</td></tr>`).join(""):`<tr><td colspan="3">No support tickets.</td></tr>`;
    document.getElementById("adminPanel").innerHTML=`<h3>Support Tickets</h3><table class="dash-table"><tr><th>Type</th><th>Message</th><th>Status</th></tr>${rows}</table>`;
}

function openOwnerDashboard(){
    showDashboard(`
      <div class="dashboard-head"><div><h2>🍽️ Restaurant Owner Panel</h2><p>Manage your restaurant and incoming orders.</p></div><button class="dashboard-close" onclick="closeDashboard()">×</button></div>
      <div class="dashboard-grid"><div class="dash-stat">🏪 Restaurant<b>Spice Route</b></div><div class="dash-stat">📦 Orders<b>${orders.length}</b></div><div class="dash-stat">🍴 Menu<b>${foods.length}</b></div><div class="dash-stat">⭐ Rating<b>4.9</b></div></div>
      <div class="admin-actions"><button class="outline-btn" onclick="ownerOrders()">📦 Orders</button><button class="outline-btn" onclick="ownerMenu()">🍴 Menu</button><button class="outline-btn" onclick="showToast('Restaurant settings saved demo ⚙️')">⚙️ Settings</button></div>
      <div id="ownerPanel"></div>`);
    ownerOrders();
}
function ownerOrders(){
    const box=document.getElementById("ownerPanel");
    if(!orders.length){box.innerHTML='<div class="empty-box">No incoming orders.</div>';return}
    box.innerHTML=`<table class="dash-table"><tr><th>Order</th><th>Items</th><th>Status</th><th>Action</th></tr>${orders.map(o=>`<tr><td>#${o.id}</td><td>${o.items.map(i=>i.name+" ×"+i.quantity).join(", ")}</td><td>${o.status}</td><td><button class="outline-btn" onclick="updateOwnerOrder('${o.id}')">Update</button></td></tr>`).join("")}</table>`;
}
function updateOwnerOrder(id){
    const o=orders.find(x=>x.id===id);if(!o)return;
    const steps=["Order Confirmed","Preparing Food","Out for Delivery","Delivered"],idx=steps.indexOf(o.status);
    o.status=steps[Math.min(idx+1,steps.length-1)];save();renderOrders();ownerOrders();showToast("Order status updated: "+o.status);
}
function ownerMenu(){
    document.getElementById("ownerPanel").innerHTML=`<h3>Restaurant Menu</h3><div class="checkout-summary"><b>Menu items</b><p>${foods.filter(f=>f.restaurant==="Spice Route").map(f=>f.name+" — ₹"+f.price).join("<br>")}</p></div><button class="primary-btn" onclick="showToast('Menu editor can be connected to a backend in the next phase 🍴')">+ Add Menu Item</button>`;
}

function openSupport(type){
    showModal(`<button class="close" onclick="closeModal()">×</button><h2>📞 ${type}</h2><p>Tell us how we can help.</p><textarea id="supportMessage" rows="5" placeholder="Describe your issue..."></textarea><button class="primary-btn" onclick="submitSupport('${type}')">Submit Request</button>`);
}
function submitSupport(type){
    const message=document.getElementById("supportMessage").value.trim();if(!message){showToast("Please describe your issue");return}
    supportTickets.push({type,message,status:"Open",date:new Date().toLocaleString()});saveV2();closeModal();showToast("Support request submitted 🎫");
}

function showDashboard(html){document.getElementById("dashboardContent").innerHTML=html;document.getElementById("dashboardModal").classList.add("active")}
function closeDashboard(){document.getElementById("dashboardModal").classList.remove("active")}
document.getElementById("dashboardModal").addEventListener("click",e=>{if(e.target.id==="dashboardModal")closeDashboard();});

/* ===== FoodieGo 200 Feature Hub ===== */
(function(){
  function renderFeatureHub(){
    const hub=document.getElementById('featureHub');
    const search=(document.getElementById('featureSearch')?.value||'').toLowerCase().trim();
    const group=(document.getElementById('featureGroupFilter')?.value||'all');
    if(!hub || !window.FOODIEGO_200_GROUPS) return;
    let visible=0, html='';
    window.FOODIEGO_200_GROUPS.forEach(g=>{
      const items=[];
      g.features.forEach(x=>{
        if((group==='all'||group===g.name) && (!search||x.f.toLowerCase().includes(search))){
          items.push(x);
        }
      });
      if(items.length){
        visible+=items.length;
        html += '<article class="feature-group"><h3>'+g.name+'</h3><ol>'+
          items.map(x=>'<li><span class="feature-number">#'+x.n+'</span>'+x.f+'</li>').join('')+
          '</ol></article>';
      }
    });
    hub.innerHTML=html||'<div class="feature-empty">No matching feature found.</div>';
    const c=document.getElementById('featureVisibleCount'); if(c)c.textContent=visible;
  }
  window.resetFeatureHub=function(){
    const s=document.getElementById('featureSearch'), f=document.getElementById('featureGroupFilter');
    if(s)s.value=''; if(f)f.value='all'; renderFeatureHub();
  };
  function init(){
    const f=document.getElementById('featureGroupFilter');
    if(f && window.FOODIEGO_200_GROUPS){
      window.FOODIEGO_200_GROUPS.forEach(g=>{
        const o=document.createElement('option'); o.value=g.name; o.textContent=g.name; f.appendChild(o);
      });
      f.addEventListener('change',renderFeatureHub);
    }
    document.getElementById('featureSearch')?.addEventListener('input',renderFeatureHub);
    renderFeatureHub();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

/* ===== Production API Integration ===== */
const FOODIE_API = "/api";
let foodieToken = localStorage.getItem("foodieToken") || "";
function apiHeaders(extra={}) {
  const h={"Content-Type":"application/json",...extra};
  if(foodieToken) h.Authorization="Bearer "+foodieToken;
  return h;
}
async function api(path, options={}) {
  const res=await fetch(FOODIE_API+path,{...options,headers:apiHeaders(options.headers||{})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error||"Request failed");
  return data;
}
function setSession(data){
  foodieToken=data.token||"";
  localStorage.setItem("foodieToken",foodieToken);
  currentUser=data.user||null;
  localStorage.setItem("foodieCurrentUser",JSON.stringify(currentUser));
  saveV2();
}
async function realSignup(){
  try{
    const data=await api("/auth/signup",{method:"POST",body:JSON.stringify({
      name:document.getElementById("authName").value.trim(),
      email:document.getElementById("authEmail").value.trim(),
      password:document.getElementById("authPassword").value,
      phone:document.getElementById("authPhone").value.trim()
    })});
    setSession(data); closeDashboard(); showToast("Account created successfully 🎉");
  }catch(e){showToast(e.message);}
}
async function realLogin(){
  try{
    const data=await api("/auth/login",{method:"POST",body:JSON.stringify({
      email:document.getElementById("authEmail").value.trim(),
      password:document.getElementById("authPassword").value
    })});
    setSession(data); closeDashboard(); showToast("Login successful 👋");
  }catch(e){showToast(e.message);}
}
function signupUser(){ if(document.getElementById("authName")) realSignup(); }
function loginUser(){ if(document.getElementById("authEmail")) realLogin(); }

async function syncOrdersFromBackend(){
  if(!foodieToken)return;
  try{
    const rows=await api("/orders");
    orders=rows.map(o=>({id:o.public_id,date:o.created_at,items:(o.items||[]).map(i=>({name:i.name,quantity:i.quantity})),total:o.total,status:o.status,address:o.address,paymentStatus:o.payment_status}));
    save(); renderOrders();
  }catch(e){}
}
async function createBackendOrder(payload){
  return api("/orders",{method:"POST",body:JSON.stringify(payload)});
}
async function trackOrderLive(id){
  if(!foodieToken){ trackOrder(id); return; }
  try{
    const o=await api("/orders/"+encodeURIComponent(id));
    const steps=["Order Confirmed","Preparing Food","Out for Delivery","Delivered"];
    const current=steps.indexOf(o.status);
    const markup=steps.map((s,i)=>`<div class="track-step ${i<=current?"done":""}"><span class="track-dot">${i<=current?"✓":i+1}</span><div><b>${s}</b><p>${o.events?.find(e=>e.status===s)?.note||"Waiting for update."}</p></div></div>`).join("");
    showModal(`<button class="close" onclick="closeModal()">×</button><h2>📦 Track Order #${o.public_id}</h2><p>Status: <b>${o.status}</b></p><div class="tracking">${markup}</div><button class="primary-btn" onclick="closeModal()">Close</button>`);
  }catch(e){trackOrder(id);}
}
window.trackOrder=trackOrderLive;

async function loadBackendData(){
  try{
    const h=await fetch("/api/health");
    const badge=document.getElementById("foodieBackendStatus");
    if(badge){badge.textContent=h.ok?"● Backend connected":"○ Demo mode";}
  }catch(e){}
  await syncOrdersFromBackend();
}
document.addEventListener("DOMContentLoaded",()=>setTimeout(loadBackendData,300));

async function payWithRazorpay(localOrderId, amount, prefill={}){
  if(!foodieToken) throw new Error("Please login before online payment");
  const data=await api("/payments/order",{method:"POST",body:JSON.stringify({localOrderId,amount})});
  if(!window.Razorpay) throw new Error("Razorpay Checkout script is not loaded");
  return new Promise((resolve,reject)=>{
    const rzp=new Razorpay({
      key:data.keyId,amount:data.order.amount,currency:data.order.currency,
      name:"FoodieGo",description:"Food delivery order",order_id:data.order.id,
      prefill:{name:prefill.name||"",email:prefill.email||"",contact:prefill.phone||""},
      handler:async response=>{
        try{const v=await api("/payments/verify",{method:"POST",body:JSON.stringify(response)});resolve(v);}
        catch(e){reject(e);}
      },
      modal:{ondismiss:()=>reject(new Error("Payment window closed"))}
    });
    rzp.open();
  });
}
