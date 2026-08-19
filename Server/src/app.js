import express from "express";
import prisma from "./lib/prisma.js";
import errorMiddleware from "./middlewares/error.middleware.js"
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js"
const app = express();
import cors from "cors";

app.use(cors({
    origin:"http://localhost:5173",
})
);

app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status: true,
            message: "Server and database are running fine",
        });
    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            status: false,
            message: "Database connection failed",
        });
    }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspace",workspaceRoutes);

app.use(errorMiddleware);

export default app;