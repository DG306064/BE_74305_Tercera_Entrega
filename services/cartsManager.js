import { writeFile, readFile } from 'fs/promises';

const filePath = './public/json/carts.json'

class CartsManager {
    constructor() {
        this.filePath = filePath
        this.carts = []
    }

    async writeFile(path, array) {
        return await writeFile(path, JSON.stringify(array, null, 2))
    }

    async getCarts() {
        const cartsJson = await this.readFile(filePath)
        const carts = JSON.parse(cartsJson)
        return carts
    }

    async getCartById(cid) {
        const cartsJson = await this.readFile(filePath)
        const carts = JSON.parse(cartsJson)
        const cart = carts.find(c => c.id === cid)
        return cart
    }

    async addCart(cartProducts) {
        const cartsJson = await this.readFile(filePath)
        const carts = JSON.parse(cartsJson)
        const newId = carts.length ? carts[carts.length - 1].id + 1 : 1
        const newCart = {
            id: newId,
            products: cartProducts
        }

        carts.push(newCart)
        this.writeFile(filePath, carts)
    }

    async addProductToCart(cid, pid, quantity) {
        const carts = await this.getCarts()

        if (carts.some(c => c.id === cid)) {

            const cartIndex = carts.findIndex(c => c.id === cid)
            console.log (cartIndex)
            console.log(carts[cartIndex])

            if (carts[cartIndex].products.some(p => p.id === pid)) {
                
                const productIndex = carts[cartIndex].products.findIndex(p => p.id === pid)
                
                console.log (cartIndex)
                console.log(carts[cartIndex].products[productIndex])

                carts[cartIndex].products[productIndex].quantity += quantity

            } else {

                const newProduct = {
                    id: pid,
                    quantity: quantity
                }
                carts[cartIndex].products.push(newProduct)

            }
        }else{
            return "No existe el carrito."
        }


        this.writeFile(filePath, carts)
        return "Producto guardado correctamente"
    }
}

export default CartsManager;