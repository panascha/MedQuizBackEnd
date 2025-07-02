const Quiz = require('../models/Quiz');
const Report = require('../models/Report');
const Keyword = require('../models/Keyword');
const User = require('../models/User');

exports.getStatOverAll = async (req, res) => {
    try{
        const [QuizCount, ReportCount, KeywordCount, UserCount, pendingQuizzes, pendingKeywords, pendingReports] = await Promise.all([
            Quiz.countDocuments(),
            Report.countDocuments(),
            Keyword.countDocuments(),
            User.countDocuments(),
            Quiz.countDocuments({ status: 'pending' }),
            Keyword.countDocuments({ status: 'pending' }),
            Report.countDocuments({ status: 'pending' })
        ]);

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

exports.getDailyActivity = async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required in body (YYYY-MM-DD)' });
        }
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);

        const dateRange = { $gte: start, $lt: end };

        const [quizCreated, quizUpdated, keywordCreated, keywordUpdated, reportCreated, reportUpdated] = await Promise.all([
            Quiz.countDocuments({ createdAt: dateRange }),
            Quiz.countDocuments({ updatedAt: dateRange, $expr: { $ne: ["$createdAt", "$updatedAt"] } }),
            Keyword.countDocuments({ createdAt: dateRange }),
            Keyword.countDocuments({ updatedAt: dateRange, $expr: { $ne: ["$createdAt", "$updatedAt"] } }),
            Report.countDocuments({ createdAt: dateRange }),
            Report.countDocuments({ updatedAt: dateRange, $expr: { $ne: ["$createdAt", "$updatedAt"] } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                quiz: { created: quizCreated, updated: quizUpdated },
                keyword: { created: keywordCreated, updated: keywordUpdated },
                report: { created: reportCreated, updated: reportUpdated }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: 'Error fetching daily activity' });
    }
}