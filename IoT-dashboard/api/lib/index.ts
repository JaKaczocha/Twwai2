import DataController from './controllers/data.controllers';
import App from './app';
import IndexController from "./controllers/index.controller";
import UserController from './controllers/user.controller';
import {Server as SocketServer} from 'socket.io';

const app: App = new App([
    new UserController(),
    new DataController(),
    new IndexController()
   
]);

app.listen();