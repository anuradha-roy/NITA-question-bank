import express, { type Request, type Response } from "express";
import { executeQuery, testConnection } from "../database/connectDB";
import { apiRoute } from "../routes/apiRouter";

const app = express();

// use a api route
app.use("/api", apiRoute);

app.get("/", (req: Request, res: Response) =>
    res.send("Hello World from Home")
);

// /db routh to check database connection
app.get("/checkdb", async (_req: Request, res: Response): Promise<void> => {
    console.log(process.env.DB_HOST);
    try {
        await testConnection();
        res.send("Database connection test passed.");
    } catch (error) {
        res.status(500).send("Database connection test failed.");
    }
});

app.get("/test", (_req: Request, _res: Response) => {
    async function logInstituteAltNames(): Promise<void> {
        const sql = "SELECT alt_name FROM institute";
        try {
            const rows = await executeQuery(sql);
            rows.forEach((row: any) => {
                const altNames = JSON.parse(row.alt_name);
                console.log("Alt Names:", altNames);
            });
        } catch (error) {
            console.error("Error fetching institute alt names:", error);
            throw error;
        }
    }
      
    // Call the function to log the institute alt names
    logInstituteAltNames();
});      

export default app;
