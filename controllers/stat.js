const Quiz = require('../models/Quiz');
const Report = require('../models/Report');
const Keyword = require('../models/Keyword');
const User = require('../models/User');

exports.getStatOverAll = async (req,res) => {
    try{
        // Get total counts and pending counts in parallel
        const [QuizCount, ReportCount, KeywordCount, UserCount, pendingQuizzes, pendingKeywords, pendingReports] = await Promise.all([
            Quiz.countDocuments(),
            Report.countDocuments(),
            Keyword.countDocuments(),
            User.countDocuments(),
            Quiz.countDocuments({ status: 'pending' }),
            Keyword.countDocuments({ status: 'pending' }),
            Report.countDocuments({ status: 'pending' })
        ]);

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
        res.status(400).json({ success: false, message: 'Error fetching statistics'});    
    }
}