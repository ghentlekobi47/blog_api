import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './database/dbconnection.js';
import User from './database/models/userModel.js';
import router from './routes/userRoutes.js';

dotenv.config();

// fail fast if required configuration is missing
const requiredEnv = ["DB_NAME", "DB_USER", "DB_HOST", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
    console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/users", router);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");
        await User.sync();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
};

startServer();

export default app;
