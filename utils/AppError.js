// error with an HTTP status code, thrown by services and mapped by controllers
export class AppError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

// send an error response; hide details of unexpected (500) errors
export const sendError = (res, error) => {
    if (error instanceof AppError) {
        return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
};
