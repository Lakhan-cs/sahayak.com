const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
    {
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        refreshtoken: {
            type: String,
            required: true,
            unique: true
        },
        
        sessionid: {
            type: String,
            required: true,
            unique: true
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
