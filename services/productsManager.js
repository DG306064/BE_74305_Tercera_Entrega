import { writeFile, readFile } from 'fs/promises';
const filePath = './config/models/Product.model.js';

class ProductsManager{
    constructor(){
        this.filePath = filePath
        this.products = []
    }

    async readFile(path){
        return await readFile(path,'utf-8')
    }

    async writeFile(path, array){
        return await writeFile(path, JSON.stringify(array, null, 2))
    }

    async getProducts(){
        const productsJson = await this.readFile(filePath)
        const products = JSON.parse(productsJson)
        return products 
    }

    async getProductById(pid){
        const productJson = await this.readFile(filePath)
        const products = JSON.parse(productJson)
        const product = products.find(p => p.id === pid)
        return product
    }

    async addProduct(productData){
        const productJson = await this.readFile(filePath)
        const products = JSON.parse(productJson)
        const newId = products.length ? products[products.length - 1].id + 1 : 1
        const newProduct = {
            id: newId,
            title: productData.title,
            description: productData.description,
            code: productData.code,
            price: productData.price,
            status: productData.status,
            stock: productData.stock,
            category: productData.category,
            thumbnails: productData.thumbnails
        }
        
        products.push(newProduct)
        await this.writeFile(filePath, products)
        return newProduct
    }

    async updateProduct(pid, productData){
        
        const productsJson = await this.readFile(filePath)
        const products = JSON.parse(productsJson)
        const productIndex = products.findIndex(p => p.id === pid)
        
        if(productIndex === -1){
            return "El id del producto no existe"
        }
        
        products[productIndex] = {
            ...products[productIndex],
            ...productData
        }

        await this.writeFile(filePath,products)

        return products[productIndex]
    }

    async deleteProduct(pid){

        const productsJson = await this.readFile(filePath)
        const products = JSON.parse(productsJson)

        const filteredProducts = products.filter(p => p.id !== pid)

        await this.writeFile(filePath,filteredProducts)

        return "Producto borrado correctamente"
    }
}

export default ProductsManager