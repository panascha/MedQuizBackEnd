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

exports.getStatUser = async (req, res) => {
    try {
        const [quizStats, keywordStats, reportStats] = await Promise.all([
            Quiz.aggregate([
                { $group: { _id: "$user", quizCount: { $sum: 1 } } }
            ]),
            Keyword.aggregate([
                { $group: { _id: "$user", keywordCount: { $sum: 1 } } }
            ]),
            Report.aggregate([
                { $group: { _id: "$User", reportCount: { $sum: 1 } } }
            ])
        ]);

        const userMap = new Map();
        quizStats.forEach(q => {
            if (!userMap.has(q._id?.toString())) userMap.set(q._id?.toString(), { user: q._id, quizCount: 0, keywordCount: 0, reportCount: 0 });
            userMap.get(q._id?.toString()).quizCount = q.quizCount;
        });
        keywordStats.forEach(k => {
            if (!userMap.has(k._id?.toString())) userMap.set(k._id?.toString(), { user: k._id, quizCount: 0, keywordCount: 0, reportCount: 0 });
            userMap.get(k._id?.toString()).keywordCount = k.keywordCount;
        });
        reportStats.forEach(r => {
            if (!userMap.has(r._id?.toString())) userMap.set(r._id?.toString(), { user: r._id, quizCount: 0, keywordCount: 0, reportCount: 0 });
            userMap.get(r._id?.toString()).reportCount = r.reportCount;
        });

        const userStats = Array.from(userMap.values()).map(u => ({
            ...u,
            total: (u.quizCount || 0) + (u.keywordCount || 0) + (u.reportCount || 0)
        }));

        const userIds = userStats.map(u => u.user);
        const users = await User.find({ _id: { $in: userIds } }, 'name email role');
        const userInfoMap = new Map(users.map(u => [u._id.toString(), u]));
        const populatedStats = userStats.map(u => ({
            ...u,
            user: userInfoMap.get(u.user?.toString()) || u.user
        }));

        populatedStats.sort((a, b) => b.total - a.total);

        res.status(200).json({
            success: true,
            data: populatedStats
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: 'Error fetching user statistics' });
    }
}

exports.getStatByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required in params' });
        }
        const [quizCount, keywordCount, reportCount, user] = await Promise.all([
            Quiz.countDocuments({ user: userId }),
            Keyword.countDocuments({ user: userId }),
            Report.countDocuments({ User: userId }),
            User.findById(userId, 'name email role')
        ]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const total = quizCount + keywordCount + reportCount;
        res.status(200).json({
            success: true,
            data: {
                user,
                quizCount,
                keywordCount,
                reportCount,
                total
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: 'Error fetching user statistics' });
    }
}