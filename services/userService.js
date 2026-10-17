import { findUserByUsername, findUserByEmail, createUser } from "../repositories/userRepository.js";
import { AppError } from "../utils/AppError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// sanitize new user data
const sanitizeUser = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.username,
    email: user.email,
    createdAt: user.createdAt,
});

const SALT_ROUNDS = 10;

// register a new user
export const registerUser = async ({firstName, lastName, userName, email, password}) =>  {

// check if user with the same email or userName already exists

    const isEmailTaken = await findUserByEmail(email);
    const isUsernameTaken = await findUserByUsername(userName);
    if (isEmailTaken) {
        throw new AppError("Email is already taken", 409);
    }
    if (isUsernameTaken) {
        throw new AppError("Username is already taken", 409);
    }

// hash the password 
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// create a new user
    try {
        const newUser = await createUser({firstName, lastName, username: userName, email, password: hashedPassword});
        return sanitizeUser(newUser);
    } catch (error) {
        // another request registered the same email/username between the checks and the insert
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new AppError("Email or username is already taken", 409);
        }
        throw error;
    }
};


// login a user

export const loginUser = async ({email, password}) => {

    const user = await findUserByEmail(email);

    if (!user || !await bcrypt.compare(password, user.password)) {
        throw new AppError("Invalid email or password", 401);

    }

    const token = jwt.sign(
        {id: user.id, username: user.username, email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    
);
    return {user: sanitizeUser(user), token};
};
