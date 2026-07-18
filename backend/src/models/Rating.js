import mongoose from "mongoose";
import Doctor from "./Doctor.js";
import Hospital from "./Hospital.js";

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    rateableType: {
        type: String,
        enum: ["Hospital", "Doctor"],
        required: true,
    },

    rateableId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "rateableType",
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },

    review: {
        type: String,
        maxlength: 1000,
    },

    createdAt: { type: Date, default: Date.now },
});

ratingSchema.index(
    { userId: 1, rateableId: 1, rateableType: 1 },
    { unique: true }
);

ratingSchema.statics.recalculateRating = async function (
    rateableId,
    rateableType
) {
    const stats = await this.aggregate([
        {
            $match: {
                rateableId: new mongoose.Types.ObjectId(rateableId),
                rateableType,
            },
        },
        {
            $group: {
                _id: "$rateableId",
                avgRating: { $avg: "$rating" },
                ratingCount: { $sum: 1 },
            },
        },
    ]);

    if (stats.length === 0) return;

    if (rateableType === "Doctor") {
        await Doctor.findByIdAndUpdate(rateableId, {
            averageRating: stats[0].avgRating,
            ratingCount: stats[0].ratingCount,
        });
    }

    if (rateableType === "Hospital") {
        await Hospital.findByIdAndUpdate(rateableId, {
            averageRating: stats[0].avgRating,
            ratingCount: stats[0].ratingCount,
        });
    }
};

// HOOKS
ratingSchema.post("save", function () {
    this.constructor.recalculateRating(this.rateableId, this.rateableType);
});

ratingSchema.post("findOneAndUpdate", function (doc) {
    if (doc) {
        doc.constructor.recalculateRating(doc.rateableId, doc.rateableType);
    }
});

ratingSchema.post("findOneAndDelete", function (doc) {
    if (doc) {
        doc.constructor.recalculateRating(doc.rateableId, doc.rateableType);
    }
});

export default mongoose.model("Rating", ratingSchema);