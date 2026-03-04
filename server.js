const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer"); 
const path = require("path");    
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
app.use(express.json()); 
app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Database Connection
mongoose.connect("mongodb+srv://TeamAKSH:AKSH%402006@cluster0.cb7zcxn.mongodb.net/shyam-baba-creations?appName=Cluster0")
    .then(() => console.log("MongoDB Connected Successfully! ✅"))
    .catch((err) => console.log("MongoDB Connection Error: ", err));

// ☁️ Cloudinary Setup (Photo Godown)
cloudinary.config({
    cloud_name: 'dt9r3kjva',
    api_key: '717345448327714',
    api_secret: 'TUMHARA_API_SECRET_YAHAN_PASTE_KARO' // 🔒 Apne Notepad se 'br4mkz...' wali key yahan daalo
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'shyam-baba-products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});
const upload = multer({ storage: storage });

// Schemas
const productSchema = new mongoose.Schema({
    name: String, price: Number, images: [String], description: String, category: String 
});
const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
    customerName: String, 
    phone: String, 
    address: String, 
    paymentMethod: String,
    transactionId: String, 
    items: Array, 
    totalAmount: Number, 
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- ADMIN LOGIN ---
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "shyambaba@7999" && password === "Avika@799944") {
        res.json({ success: true, token: "SHYAM-BABA-SECRET-KEY-2026" });
    } else {
        res.status(401).json({ success: false, message: "Ghalat ID ya Password!" });
    }
});

// --- PRODUCT APIs ---
app.post("/api/products", upload.array('images', 5), async (req, res) => {
    try {
        const imageUrls = req.files.map(file => file.path); // 🚀 NAYA: Ab direct Cloudinary ki link save hogi
        const newProduct = new Product({ ...req.body, images: imageUrls });
        await newProduct.save();
        res.json({ message: "Product Uploaded! 🎉" });
    } catch (err) { res.status(500).json({ message: "Upload failed" }); }
});

app.get("/api/products", async (req, res) => { 
    res.json(await Product.find()); 
});

app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Product nahi mila!" });
    }
});

// --- ORDER APIs ---
app.post("/api/orders", async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.json({ message: "Success", orderId: savedOrder._id }); 
    } catch (err) { res.status(500).json({ message: "Order error" }); }
});

app.get("/api/orders", async (req, res) => {
    res.json(await Order.find().sort({ date: -1 }));
});

app.put("/api/orders/:id", async (req, res) => {
    // 🚀 NAYA: Mongoose ka deprecation warning fix kar diya 'returnDocument' lagakar
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' });
    res.json(updated);
});

app.get("/api/order-status/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        res.json({ status: order ? order.status : 'Pending' });
    } catch (e) { res.json({ status: 'Pending' }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT} 🚀`));