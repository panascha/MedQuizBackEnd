const Keyword = require('../models/Keyword');

exports.getKeywords = async (req, res, next) => {
    try {
        // Get status from query parameters
        const { status } = req.query;
        
        // Build query object
        const query = {};
        if (status) {
            query.status = status;
        }

        const keyword = await Keyword.find(query)
            .populate("subject")
            .populate("category")
            .populate("user");
            
        res.status(200).json({ success: true, count: keyword.length, data: keyword });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getKeywordOnlyApproved = async (req, res) => {
    try {
        const keyword = await Keyword.find({status: "approved"})
            .populate("subject")
            .populate("category");
        res.status(200).json({ success: true, count: keyword.length, data: keyword });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getKeywordByCategoryID = async (req, res) => {
    try {
        const keyword = await Keyword.find({category: req.params.cateId});
        if(!keyword){
            return res.status(200).json({ success: true, data: {}});
        }
        res.status(200).json({ success: true, count: keyword.length, data: keyword });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getKeyword = async (req, res, next) => {
    try {
        const keyword = await Keyword.findById(req.params.id)
            .populate("subject")
            .populate("category");
        if (!keyword) return res.status(404).json({ success: false, message: "there is no ID of this keyword" });

        res.status(200).json({ success: true, data: keyword });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.createKeyword = async (req, res, next) => {
    try {
        // Extract user ID from the token payload
        const userId = req.user.id || req.user._id;  // Try both id and _id
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID not found in token"
            });
        }
        // Set the user ID in the request body
        req.body.user = userId;
        if(req.user.role !== 'S-admin'){
            req.body.status = "pending";
        } else {
            req.body.status = "approved";
        }
        const keyword = await Keyword.create(req.body);
        res.status(201).json({ success: true, data: keyword });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.updateKeyword = async (req, res, next) => {
    try {
        const keyword = await Keyword.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!keyword) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: keyword });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteKeyword = async (req, res, next) => {
    try {
        const keyword = await Keyword.findByIdAndDelete(req.params.id);

        if (!keyword) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};