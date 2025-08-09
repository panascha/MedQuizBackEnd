const Quiz = require('../models/Quiz');
const Report = require('../models/Report');
const Keyword = require('../models/Keyword');
const User = require('../models/User');

exports.getStatOverAll = async (req, res) => {
    try{
        const [QuizCount, ReportCount, KeywordCount, UserCount, pendingQuizzes, pendingKeywords, pendingReports] = await Promise.all([
            Quiz.countDocuments({ status: 'approved' }),
            Report.countDocuments({ status: 'approved' }),
            Keyword.countDocuments({ status: 'approved' }),
            User.countDocuments({ status: 'approved' }),
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
                { $match: { status: 'approved' } },
                { $group: { _id: "$user", quizCount: { $sum: 1 } } }
            ]),
            Keyword.aggregate([
                { $match: { status: 'approved' } },
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
        const users = await User.find({ _id: { $in: userIds } });
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

exports.getStatByUserIdAndSubject = async (req, res) => {
    try {
        const userId = req.params.userId;
        const subjectId = req.params.subjectId; 
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required in params' });
        }

        const quizFilter = { user: userId, status: 'approved' };
        const keywordFilter = { user: userId, status: 'approved' };
        
        if (subjectId) {
            quizFilter.subject = subjectId;
            keywordFilter.subject = subjectId;
        }

        const quizCountPromise = Quiz.countDocuments(quizFilter);
        const keywordCountPromise = Keyword.countDocuments(keywordFilter);
        
        const reportCountPromise = (async () => {
            let quizIds, keywordIds;
            
            if (subjectId) {
                [quizIds, keywordIds] = await Promise.all([
                    Quiz.find({ subject: subjectId, status: 'approved' }, '_id'),
                    Keyword.find({ subject: subjectId, status: 'approved' }, '_id')
                ]);
            } else {
                [quizIds, keywordIds] = await Promise.all([
                    Quiz.find({ user: userId, status: 'approved' }, '_id'),
                    Keyword.find({ user: userId, status: 'approved' }, '_id')
                ]);
            }
            
            const quizIdList = quizIds.map(q => q._id);
            const keywordIdList = keywordIds.map(k => k._id);
            
            if (quizIdList.length === 0 && keywordIdList.length === 0) {
                return 0;
            }
            
            const reportQuery = { User: userId };
            const orConditions = [];
            
            if (quizIdList.length > 0) {
                orConditions.push({ originalQuiz: { $in: quizIdList } });
                orConditions.push({ suggestedChanges: { $in: quizIdList } });
            }
            
            if (keywordIdList.length > 0) {
                orConditions.push({ originalKeyword: { $in: keywordIdList } });
                orConditions.push({ suggestedChangesKeyword: { $in: keywordIdList } });
            }
            
            if (orConditions.length > 0) {
                reportQuery.$or = orConditions;
            }
            
            return Report.countDocuments(reportQuery);
        })();

        const userPromise = User.findById(userId);

        const [quizCount, keywordCount, reportCount, user] = await Promise.all([
            quizCountPromise,
            keywordCountPromise,
            reportCountPromise,
            userPromise
        ]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const total = quizCount + keywordCount + reportCount;

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    year: user.year,
                    status: user.status
                },
                subjectId: subjectId || null,
                quizCount,
                keywordCount,
                reportCount,
                total
            }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: 'Error fetching user statistics by subject' });
    }
};