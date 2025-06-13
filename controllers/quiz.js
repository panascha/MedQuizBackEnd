const Quiz = require('../models/Quiz');
const Subject = require('../models/Subject');
const Category = require('../models/Category');

exports.getQuizzes = async (req, res, next) => {
    try {
        const quiz = await Quiz.find()
            .populate({path: "user"})
            .populate({path: "subject" })
            .populate({path: "category" });
        res.status(200).json({ success: true, count: quiz.length, data: quiz });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getQuizzesByFilter = async (req, res) => {
    const filter = {};
    if (req.params.subjectID) filter.subject = req.params.subjectID;
    if (req.params.categoryID) filter.category = req.params.categoryID;
    
    // Add status filter with validation
    if (req.query.status) {
        const validStatuses = ["pending", "approved", "rejected", "reported"];
        if (!validStatuses.includes(req.query.status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Must be one of: pending, approved, rejected, reported" 
            });
        }
        filter.status = req.query.status;
    }

    try {
        const quizzes = await Quiz.find(filter)
            .populate({path: "user"})            
            .populate({path: "subject" })
            .populate({path: "category" });
            
        res.status(200).json({ 
            success: true, 
            count: quizzes.length, 
            data: quizzes 
        });
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch quizzes" 
        });
    }
};

exports.getQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findById(req.params.id)            
            .populate({path: "subject" })
            .populate({path: "category" });
        if (!quiz) {
            return res.status(404).json({ success: false });
        }

        res.status(200).json({ success: true, data: quiz });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.createQuiz = async (req, res, next) => {
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

        // Validate subject and category
        const subject = await Subject.findById(req.body.subject);
        const category = await Category.findById(req.body.category);

        if(!subject) {
            return res.status(404).json({
                success: false, 
                message: "there is no this subject"
            });
        }
        if(!category) {
            return res.status(404).json({
                success: false, 
                message: "there is no this category"
            });
        }

        // Handle multiple images
        if (req.files && req.files.length > 0) {
            req.body.img = req.files.map(file => `/public/${file.filename}`);
        } else {
            req.body.img = [];
        }
        
        const quiz = await Quiz.create(req.body);
        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        console.error(error);
        res.status(400).json({ 
            success: false, 
            error: error.message,
            details: "Error creating quiz. Please check user authentication and input data."
        });
    }
}

exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ success: false, message: "No quiz with this ID" });
        }

        const isSAdmin = req.user.role === "S-admin";
        if (!isSAdmin) {
            req.body.approved = false;
        }

        // Handle multiple images
        if (req.files && req.files.length > 0) {
            req.body.img = req.files.map(file => `/public/${file.filename}`);
        }

        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: updatedQuiz });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteQuiz = async (req, res, next) => {
    try {

        const isAdmin = req.user.role === "admin";
        const isSAdmin = req.user.role === "S-admin";

        if (!isAdmin && !isSAdmin) {
            return res.status(403).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this Quiz`,
            });
        }

        const quiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!quiz) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: {} });

    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};
