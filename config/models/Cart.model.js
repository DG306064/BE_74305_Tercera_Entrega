import mongoose from "mongoose";

const cartShema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para actualizar updatedAt
cartShema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export const Cart = mongoose.model('Cart', cartShema);