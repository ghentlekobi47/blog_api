import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './database/dbconnection.js';
import router from './routes/userRoutes.js';

dotenv.config();

const app = express();



app.use(express.json());
app.use(cors());
app.use("/api/users", router);
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

startServer();

export default app;