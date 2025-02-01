import express, {Request, Response} from "express";
import "dotenv/config";
import mongoose from "mongoose";
import cors from "cors";
import routes from './routes/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
 

app.use('/api', routes);

//connecting mongodb uri as string
mongoose
.connect(process.env.MONGODB_URI as string)
.then(() => console.log("Conected to database!"));
app.get("/health", async (req: Request, res: Response)=> {
  res.send({message: "Health ok!"})
})

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));