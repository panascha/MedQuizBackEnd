const Quiz = require('../models/Quiz');
const Report = require('../models/Report');
const Keyword = require('../models/Keyword');
const User = require('../models/User');

exports.getStatOverAll = async (req,res) => {
    try{
        // Get total counts
        const QuizCount = await Quiz.countDocuments();
        const ReportCount = await Report.countDocuments();
        const KeywordCount = await Keyword.countDocuments();
        const UserCount = await User.countDocuments();

        // Get pending counts
        const pendingQuizzes = await Quiz.countDocuments({ status: 'pending' });
        const pendingKeywords = await Keyword.countDocuments({ status: 'pending' });
        const pendingReports = await Report.countDocuments({ status: 'pending' });

        // Return all statistics
        res.status(200).json({
            success: true,
            data: {
                totalQuizzes: QuizCount,
                totalReports: ReportCount,
                totalKeywords: KeywordCount,
                totalUsers: UserCount,
                totalPendingQuizzes: pendingQuizzes,
                totalPendingKeywords: pendingKeywords,
                totalPendingReports: pendingReports
            }
        });
        
    } catch(err){
        console.error(err);
        res.status(400).json({ success: false, message: err.message});
    }
}