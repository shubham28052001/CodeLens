import prisma from "../lib/prisma.js";
import {hashPassword,comparePassword} from "../utils/password.js";
import {ConflictError,UnauthorizedError} from "../utils/errors.js"
import {generateAccessToken} from "../utils/jwt.js"

export const registerUser = async (name, email, password) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if(existingUser){
        throw new ConflictError("User already exists");
    }

    const hashedPassword=await hashPassword(password);

    const user = await prisma.user.create({
        data:{
            name,
            email,
            password:hashedPassword
        },
        select:{
            id:true,
            name:true,
            email:true,
            createdAt:true
        }
    });
    return user;
}


export const loginUser= async (email,password)=>{
    const user = await prisma.user.findUnique({
        where:{
            email
        }
    });
    if(!user){
        throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid=await comparePassword(
        password,
        user.password
    );

    if(!isPasswordValid){
        throw new UnauthorizedError("Invalid email or password");
    }

    const token= generateAccessToken({
        userId:user.id
    });

    return {
        user:{
            id:user.id,
            user:user.name,
            email:user.email
        },
        token
    };
};
