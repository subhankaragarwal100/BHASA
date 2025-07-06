import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {
    
    try {
        const { email, password, fullName } = req.body
        
        //validations
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        //check Email id already exists or not
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists , please use a different email" });
        }

        const idx = Math.floor(Math.random() * 100) + 1; //generate a random number between 1 and 100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`; //random avatar url

        //create new user
        const newUser = await User.create({
            email,
            password,
            fullName,
            profilePic: randomAvatar,
        })

       try {
         await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic || "",
        });
        
        console.log(`Stream user upserted successfully for ${newUser.fullName}`);
        
       } catch (error) {
        console.error("Error upserting Stream user:", error);
       }

        // create JWT token
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie (Xss attack)
            sameSite: "strict", // Helps prevent CSRF attacks by not sending the cookie with cross-site requests
            secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent only over HTTPS in production
        });

        res.status(201).json({ success: true, user: newUser });

    } catch (error) {

        console.error("Error in signup controller:", error);
        res.status(500).json({ message: "Internal server error" });

    }
}

export async function login(req, res) {

    try {

        const { email, password } = req.body;

        //validation
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            httpOnly: true, 
            sameSite: "strict", 
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({ success: true, user });

    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export function logout(req, res) {
    res.clearCookie("jwt")
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

export async function onboard(req, res){
    try {
        const userId = req.user._id;

        const { fullName , bio , nativeLanguage , learningLanguage , location } = req.body;

        //validaitons
        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio &&  "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean),
            });
        
        }

        const updatedUser =  await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,
        }, { new: true });

        if(!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
          await upsertStreamUser({
            id: updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || "",
          });
          
          console.log(`Stream user upserted successfully for ${updatedUser.fullName}`);
          
        } catch (error) {
            console.error("Error upserting Stream user:", error);
        }

        res.status(200).json({ success: true, user: updatedUser });


    } catch (error) {
        console.error("Error in onboard controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}