import app from "./app/app";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

const server = () => {
    try{
        app.listen(PORT, () => {
            console.info(`Server is running on PORT ${PORT}`);
        });
    } catch (error) {
        console.info(error);
    }
};

server();

export default server;