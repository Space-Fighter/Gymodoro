import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";

const register = async(req, res) => {
    console.log(req.headers);
    console.log(req.body);
    const {name, email, password} = req.body;

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
        where: {email: email,},
    });
    if (userExists) {
        return res.status(400).json({error: "User already exists with this email"});
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    
    res.status(201).json({
        status: "success",
        message: "User registered successfully",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    });
}



export { register };