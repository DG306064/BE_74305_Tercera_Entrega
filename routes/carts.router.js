import { Router } from "express";
import mongoose from "mongoose";
import { Cart } from "../config/models/Cart.model.js";
import { Product } from "../config/models/Product.model.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const carts = await Cart.find().populate('products.product').lean();
    console.log(`Carritos enviados a la vista: ${carts.length}`);
    res.render("carts", {
      title: "Carritos",
      carts,
      isCarts: true,
    });
  } catch (error) {
    console.error("Error al cargar carritos:", error);
    res.status(500).render("carts", {
      title: "Carritos",
      carts: [],
      msg: "Error al cargar los carritos",
      isCarts: true,
    });
  }
});

//Carts management routes

router.get("/:cid", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.cid)) {
      return res.status(400).json({ error: "ID Invalido" });
    }
    
    // Usar populate para traer los productos completos
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado." });
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("req.body:", req.body);

    // Validar que todos los campos requeridos estén presentes
    if (!req.body.products) {
      console.error("Campos faltantes:", {
        products: !!req.body.products,
      });
      return res.status(400).json("Faltan campos requeridos");
    }

    if (!Array.isArray(req.body.products)) {
      return res
        .status(400)
        .json("Los productos deben estar incluidos en un array");
    }

    if (req.body.products.length === 0) {
      return res
        .status(400)
        .json("El carrito debe tener por lo menos un producto");
    }

    // Validar que los productos existan en la base de datos
    const productsDB = await Product.find();
    const productIds = productsDB.map(p => p._id.toString());

    for (const product of req.body.products) {
      if (!product.product || !product.quantity) {
        return res.status(400).json("Cada producto debe tener product y quantity");
      }
      
      if (!productIds.includes(product.product)) {
        return res.status(400).json("Uno de los productos no existe en la base de datos");
      }
      
      if (typeof product.quantity !== "number" || product.quantity <= 0) {
        return res.status(400).json("La cantidad debe ser un numero mayor a 0");
      }
    }

    const newCart = {
      products: req.body.products,
    };

    console.log("Intentando guardar carrito en MongoDB...");
    const savedCart = await new Cart(newCart).save();

    console.log("Carrito guardado exitosamente:", savedCart);
    console.log("ID del carrito guardado:", savedCart._id);

    // Emitir evento socket.io si está disponible
    if (req.app.get("io")) {
      req.app.get("io").emit("cartAdded", {
        message: "Carrito agregado exitosamente",
        cart: savedCart,
      });
    }

    res.status(201).json({ 
      message: "Carrito agregado correctamente",
      cart: savedCart 
    });
  } catch (error) {
    console.error("Error al agregar el carrito: ", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.cid)) {
      return res.status(400).json({ error: "ID de carrito invalido" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
      return res.status(400).json({ error: "ID de producto invalido" });
    }

    const cart = await Cart.findById(req.params.cid);
    const product = await Product.findById(req.params.pid);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({ error: "La cantidad debe ser un numero mayor a 0" });
    }

    // Buscar si el producto ya existe en el carrito
    const existingProductIndex = cart.products.findIndex(
      p => p.product === req.params.pid
    );

    if (existingProductIndex !== -1) {
      // Actualizar cantidad del producto existente
      cart.products[existingProductIndex].quantity = quantity;
    } else {
      // Agregar nuevo producto al carrito
      cart.products.push({
        product: req.params.pid,
        quantity: quantity
      });
    }

    await cart.save();

    // Obtener el carrito actualizado con populate
    const updatedCart = await Cart.findById(req.params.cid).populate('products.product');

    res.status(200).json({
      message: "Producto actualizado en el carrito correctamente",
      cart: updatedCart
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.cid)) {
      return res.status(400).json({ error: "ID Invalido" });
    }
    
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    
    cart.products = req.body.products;
    await cart.save();
    
    const updatedCart = await Cart.findById(req.params.cid).populate('products.product');
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.cid)) {
      return res.status(400).json({ error: "ID Invalido" });
    }
    
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado." });

    cart.products = [];
    await cart.save();

    res.json({ message: "Productos eliminados del carrito con exito." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.cid)) {
      return res.status(400).json({ error: "ID de carrito Invalido" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
      return res.status(400).json({ error: "ID de producto Invalido" });
    }

    const cart = await Cart.findById(req.params.cid);
    const product = await Product.findById(req.params.pid);

    if (!cart) return res.status(404).json({ error: "Carrito no encontrado." });
    if (!product) return res.status(404).json({ error: "Producto no encontrado en la base de datos." });

    // Buscar y eliminar el producto del carrito
    const productIndex = cart.products.findIndex(item => 
      item.product.toString() === req.params.pid
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito." });
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    res.status(200).json({ message: "Producto eliminado del carrito con exito." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;