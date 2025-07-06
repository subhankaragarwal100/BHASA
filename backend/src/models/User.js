import mongoose  from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName : {
        type: String, 
        required : true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    bio: {
        type: String,
        default: "",
    },
    profilePic: {
        type: String,
        default: "",
    },
    nativeLanguage: {
        type: String,
        default: "",
    },
    learningLanguage: {
        type: String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },

    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
  },
  {timestamps:true}
);

// Hash password before saving to the database
userSchema.pre("save" , async function(next){
    //if password is not modified - then dont hash
    if(!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password , salt);
        next();
    } catch (error) {
        next(error);
    }
});

//compere password
userSchema.methods.matchPassword = async function(entertedPassword) {
   const isPasswordCorrect = await bcrypt.compare(entertedPassword , this.password);
   return isPasswordCorrect;
}

const User = mongoose.model("User" , userSchema);


export default User;