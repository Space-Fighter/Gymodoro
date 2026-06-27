import express from "express";
const app = express();
const PORT = 3000;
const server = app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`);});