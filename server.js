const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path'); 
const app = express();
const PORT = 3000;

// Connecting
mongoose.connect('mongodb://localhost:27017/MyDataBase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public'));
});


app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Signup Request:', { email });

        const normalizedEmail = email.toLowerCase();

        // ✅ Check if the user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        console.log('Existing User Check:', existingUser);

        if (existingUser) {
            console.log('User already exists, blocking signup.');
            return res.status(409).json({ success: false, message: "Email already exists. Please use a different email or log in." });
        }

        // ✅ Validating
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long, include one uppercase letter, one number, and one special character."
            });
        }

   
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email: normalizedEmail, password: hashedPassword });
        await user.save();

        console.log('User saved:', user);
        res.status(201).json({ success: true, message: "Signup successful! Please log in." });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: "Internal Server Error. Please try again later." });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login Request:', { email });

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        res.json({ success: true, message: "Login successful!" });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: "Login failed" });
    }
});

// **Forgot Password Route**
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log('Forgot Password Request:', { email });

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: true, message: "Password reset email sent!" });
        } else {
            return res.json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: "Error processing request" });
    }
});

 // Your user schema

app.post("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const isRecentPassword = await bcrypt.compare(newPassword, user.password);
        if (isRecentPassword) {
            return res.status(400).json({ success: false, error: "recent_password", message: "Don't use recent passwords." });
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password reset successfully!" });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

const { spawn } = require('child_process');


let cameraProcess = null;

app.get("/open-camera", (req, res) => {
    console.log("✅ Open Camera API called"); // Debugging Log

    if (cameraProcess) {
        console.log("🚨 YOLO is already running!"); // Debugging Log
        return res.json({ success: false, message: "YOLO is already running!" });
    }

    const scriptPath = path.join(__dirname, "yolo.py");
    console.log("📂 YOLO Script Path:", scriptPath); // Debugging Log

    // Spawning the process
    cameraProcess = spawn("python", [scriptPath], {
        detached: true,
        stdio: "ignore",
    });

    cameraProcess.unref(); // Allows Node.js to exit even if this process is still running
    console.log("🚀 YOLO detection started!"); // Debugging Log

    res.json({ success: true, message: "YOLO detection started!" });
});


app.get("/close-camera", (req, res) => {
    if (!cameraProcess) {
        return res.json({ success: false, message: "YOLO is not running!" });
    }

    // Kill the process and reset
    if (cameraProcess) {
        cameraProcess.kill('SIGTERM'); // Safely stop the process
        cameraProcess = null;
        console.log("🚫 YOLO detection stopped!");
    }
    

    res.json({ success: true, message: "YOLO detection stopped!" });
});




app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




