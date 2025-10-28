const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev

    console.error(err);

    if(err.name === 'CastError'){
        const message = 'Resource not found';
        error = {message, statusCode: 404};
    }

    //mongoose duplicate key error
    if(err.code === 11000){
        const message = 'Duplicate field value entered';
        error = {message, statusCode: 400};
    } 
     if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message: message.join(', '), status: 400 };
  }

   res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;