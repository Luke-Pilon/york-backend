function errorResponseBuilder(statusCode: number, message: string){
    return {
        "status": statusCode,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": {
            "message": message
        }
    }
}

export default errorResponseBuilder