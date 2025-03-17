import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import * as dotenv from "dotenv";
import morgan from "morgan";
import { BlockChain } from "./lib/transactions";
import { setupSwagger } from "./docs";
import { blockRouter } from './routes';
import database from "./database";

const chain = new BlockChain();

dotenv.config();
const app: Express = express();

const port = process.env.PORT || 3000;

const httpServer = createServer(app);

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};
app.use(morgan("combined"));
app.use(cors(corsOptions));


app.use(express.json({ limit: '256mb' }));
app.use(express.urlencoded({ limit: '256mb', extended: false, parameterLimit: 256000 }));

setupSwagger(app);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/api', blockRouter);

(async () => {
  await database.initialize();
})();

httpServer.listen(port, async () => {

  console.log(`Listening on port http://localhost:${port}`);
});
