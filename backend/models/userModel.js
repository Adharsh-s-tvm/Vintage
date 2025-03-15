import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        // Generate username from firstname and lastname
        default: function () {
            return `${this.firstname.toLowerCase()}_${this.lastname.toLowerCase()}`;
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // isDeleted: {
    //     type: Boolean,
    //     default: false
    // },
    isAdmin: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["active", "banned"],
        default: "active"
    },

},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;