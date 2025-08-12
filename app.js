import { createServer } from 'http';
import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { connectToMongoDB } from './config/db/connect.config.js';
import homeRouter from './routes/home.router.js';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import realTimeProductsRouter from './routes/realTimeProducts.router.js';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = 3000;



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Motor de plantillas */

app.engine('hbs', engine({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('io', io);

/** Middlewares para parsear datos de formularios */
app.use(express.json()); // Para datos JSON
app.use(express.urlencoded({ extended: true })); // Para datos de formularios

/** Carpeta de archivos static y llamados a bootstrap y sweetalert*/
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/sweetalert2', express.static(path.join(__dirname, 'node_modules/sweetalert2/dist')));

/** Routers  */
app.use(('/', homeRouter));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/realTimeProducts', realTimeProductsRouter)


/** Seteo de Error 404 */
app.use((req,res) => {
    res.status(404).render('404', {title: '404 - Pagina no encontrada'});
})


/** Creacion del WebSocket */

io.on('connection', (socket)=>{
    console.log("Nuevo usuario se ha conectado")

    socket.on('realTimeProducts:message', (data) => {
        io.emit('realTimeProducts:message', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado')
    })
})

const atlas = false;

const startServer = async () => {
    try {
        await connectToMongoDB();
        httpServer.listen(PORT, () => console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`));
    } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error);
        process.exit(1);
    }
}

startServer();