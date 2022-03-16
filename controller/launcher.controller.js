exports.apply = function (req,res,next) {
    res.status(200).json({message : "success", code : 200});
}

exports.destory = function (req,res,next) {
    const err = new Error();

    err.message = "error destory";
    err.status = 200;
    next(err);
    // res.status(200).json({"message" : "success", "code" : 200});
}