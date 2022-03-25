const service = require('../services/launcher.service');

exports.apply =  async function (req,res,next) {
    console.timeStamp('apply');

    const data = req.body;

    const l = service.lancherService(data);
    

    console.timeStamp('apply');
    res.status(200).json({message : "success", code : 200});
}

exports.destory = function (req,res,next) {
    const err = new Error();

    err.message = "error destory";
    err.status = 200;
    next(err);
    // res.status(200).json({"message" : "success", "code" : 200});
}