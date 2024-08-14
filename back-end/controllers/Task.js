const { sequelize } = require("../config/mysql-sequelize");
const { Op, col } = require("sequelize");
const { getUTCTime } = require("../utils/helperfun")
const Earnings = require("../models/Earnings");
const TGUser = require("../models/TGUser");
const Tasks = require("../models/Tasks");
const moment = require('moment');
const CheckIns = require("../models/Checkin");



function getCheckinDetails(earnDetails) {

    earnDetails.current_streak = parseInt(earnDetails.current_streak);
    earnDetails.checkin_points = parseInt(earnDetails.checkin_points);

    const today = moment().utc().startOf('day');

    let lastLoginDate = null;
    if (earnDetails.last_login_at) {
        lastLoginDate = moment(earnDetails.last_login_at).utc().startOf('day');
    }

    const daysDifference = lastLoginDate ? today.diff(lastLoginDate, 'days') : null;

    let rewardPoints = 0;
    let rewardDay = 0;
    let dailycheckin = false;

    if (lastLoginDate === null || daysDifference > 3) {
        // First login or login after more than 3 days
        rewardPoints = 5000;
        rewardDay = 1;
        earnDetails.current_streak = 1;
        dailycheckin = true;

    } else if (daysDifference === 0) {
        // Already logged in today
        rewardPoints = 0;
        rewardDay = earnDetails.current_streak;
        dailycheckin = false;

    } else if (daysDifference === 1) {
        // Consecutive login
        earnDetails.current_streak += 1;
        rewardDay = earnDetails.current_streak;
        rewardPoints = earnDetails.current_streak * 5000;
        dailycheckin = true;

    } else if (daysDifference > 1 && daysDifference <= 3) {
        // Login after a short break (1-3 days)
        rewardPoints = 5000;
        rewardDay = 1;
        earnDetails.current_streak = 1;
        dailycheckin = true;

    }

    return {
        current_streak: earnDetails.current_streak,
        rewardPoints,
        rewardDay,
        dailycheckin,
        today
    }

}


async function list(req, res, next) {
    try {
        const tgUser = req.user;

        if (!tgUser || !tgUser.id) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }

        const { id: teleid } = tgUser;

        // Fetch earnings details
        const earnDetails = await Earnings.findOne({
            where: {
                userid: teleid,
            },
        });

        if (!earnDetails) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }

        // Fetch the latest check-in details
        const checkInData = await CheckIns.findOne({
            where: { userId: teleid },
            order: [['checkInDate', 'DESC']],
        });

        // Determine the last check-in date
        const today = moment().utc().startOf('day');
        const lastCheckInDate = checkInData ? moment(checkInData.checkInDate).utc().startOf('day') : null;

        // Calculate streak and reward points based on last check-in
        let rewardPoints = 0;
        let streak = 0;
        const daysDifference = lastCheckInDate ? today.diff(lastCheckInDate, 'days') : null;

        if (!lastCheckInDate || daysDifference > 1) {
            rewardPoints = 5000;
            streak = 1;
        } else if (daysDifference === 1) {
            streak = checkInData.streak + 1;
            rewardPoints = streak * 5000;
        } else {
            rewardPoints = 0;
            streak = checkInData.streak;
        }

        // Extract done task IDs
        const doneTaskIds = earnDetails.task ? earnDetails.task.split('|').map(id => parseInt(id)) : [];

        // Fetch tasks
        const whereClause = { status: "ACTIVE" };
        const tasks = await Tasks.findAll({
            where: whereClause,
            order: [["created_date", "DESC"]],
            limit: 10,
            offset: 0,
        });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'No task found', data: [] });
        }

        // Map tasks to the required format
        const taskList = tasks.map((task) => ({
            id: task.id,
            title: task.title,
            points: task.claim_score,
            url: task.follow_url,
            under_by: task.task_under_by,
            isClaimed: doneTaskIds.includes(task.id) ? "Y" : "N"
        }));

        // Prepare final response data
        const responseData = {
            tasklist: taskList,
            checkin: {
                current_streak: streak,
                rewardPoints,
                rewardDay: lastCheckInDate ? streak : 1,
                dailycheckin: !lastCheckInDate || daysDifference > 1,
                lastCheckInDate: lastCheckInDate ? lastCheckInDate.format('YYYY-MM-DD') : null,
                today: today.format('YYYY-MM-DD')
            }
        };

        console.log(taskList, responseData.checkin);
        return res.status(200).json({ message: 'Success', data: responseData });

    } catch (error) {
        console.error("Error fetching task list:", error);
        return next('An error occurred while getting the task list');
    }
}


async function claim(req, res, next) {
    try {
        const tgUser = req.user;
        const { taskID } = req.body;

        if (!tgUser || !tgUser.id) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }

        // Fetch task details
        const tasksDetails = await Tasks.findOne({
            where: {
                id: taskID,
                status: "ACTIVE"
            },
        });

        if (!tasksDetails) {
            return res.status(422).json({ error: 'Unprocessable Entity', message: 'Invalid task or task is inactive' });
        }

        const taskPoint = tasksDetails.claim_score;
        const taskId = tasksDetails.id;

        // Fetch earnings details
        const earnDetails = await Earnings.findOne({
            where: {
                userid: tgUser.id,
            },
        });

        if (!earnDetails) {
            return res.status(422).json({ error: 'Unprocessable Entity', message: 'Earnings record not found' });
        }

        // Check if the task has already been claimed
        const doneTaskIds = earnDetails.task ? earnDetails.task.split('|').filter(id => id) : [];

        if (doneTaskIds.includes(taskId)) {
            return res.status(422).json({ error: 'Unprocessable Entity', message: 'Task already claimed' });
        }

        // Update earnings
        const earnUpdate = {
            task: `${earnDetails.task ? earnDetails.task + '|' : ''}${taskId}`,
            task_score: parseInt(earnDetails.task_score) + parseInt(taskPoint),
            tap_score: parseInt(earnDetails.tap_score) + parseInt(taskPoint)
        };

        const [updated] = await Earnings.update(earnUpdate, {
            where: {
                userid: tgUser.id,
            },
        });

        if (updated > 0) {
            return res.status(200).json({ message: 'Success', data: { taskid: taskId, taskscore: taskPoint } });
        } else {
            return res.status(409).json({ error: 'Conflict', message: 'Task claim failed', data: { taskid: taskId } });
        }
    } catch (error) {
        console.error("Error claiming task score:", error);
        next("An error occurred while claiming the task score");
    }
}


async function checkin(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const tgUser = req.user;

        if (!tgUser?.id) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }

        const userId = tgUser.id;
        const today = moment().utc().startOf('day'); // Use Moment.js to create today

        // Check if the user has already checked in today
        const existingCheckIn = await CheckIns.findOne({
            where: { userId, checkInDate: today.toDate() }, // Convert to native Date for the query
            transaction
        });

        if (existingCheckIn) {
            await transaction.rollback();
            return res.status(409).json({ error: 'Conflict', message: 'Already checked in today', data: { lastCheckInDate: today.toISOString() } });
        }

        // Fetch user earnings details
        const earnDetails = await Earnings.findOne({
            where: { userid: userId },
            transaction
        });

        if (!earnDetails) {
            await transaction.rollback();
            return res.status(401).json({ error: 'Unauthorized', message: 'User earnings details not found' });
        }

        // Determine check-in details
        const lastCheckIn = await CheckIns.findOne({
            where: { userId },
            order: [['checkInDate', 'DESC']],
            transaction
        });

        const lastCheckInDate = lastCheckIn ? moment(lastCheckIn.checkInDate).utc().startOf('day') : null;
        const daysDifference = lastCheckInDate ? today.diff(lastCheckInDate, 'days') : null; // Use Moment.js diff method

        let rewardPoints = 0;
        let streak = 0;

        if (!lastCheckInDate || daysDifference > 1) {
            rewardPoints = 5000;
            streak = 1;
        } else if (daysDifference === 1) {
            streak = lastCheckIn.streak + 1;
            rewardPoints = streak * 5000;
        } else {
            rewardPoints = 0;
            streak = lastCheckIn.streak;
        }

        // Create new check-in record
        await CheckIns.create({
            userId,
            checkInDate: today.toDate(), // Convert to native Date for storage
            rewardPoints,
            streak
        }, { transaction });

        // Update earnings
        const earnUpdate = {
            current_streak: streak,
            checkin_score: rewardPoints,
            tap_score: parseInt(earnDetails.tap_score) + parseInt(rewardPoints),
            recent_login: today.toDate() // Convert to native Date for storage
        };
        
        console.log('EarnDetails before update:', earnDetails);
        console.log('EarnUpdate object:', earnUpdate);

        const [updated] = await Earnings.update(earnUpdate, {
            where: {
                userid: tgUser.id,
            },
            transaction
        });

        if (updated > 0) {
            await transaction.commit();
            console.log(`User ${userId} has checked in and earned ${rewardPoints} points. Streak: ${streak}`);
            return res.status(200).json({ message: 'Success', data: { rewardPoints, streak, lastCheckInDate: today.toISOString() } });
        } else {
            await transaction.rollback();
            return res.status(422).json({ error: 'Unprocessable Entity', message: 'Failed to update earnings' });
        }
    } catch (error) {
        await transaction.rollback();
        console.error("Error during daily check-in:", error.message, error.stack);
        next("An error occurred during daily check-in");
    }
}




module.exports = {
    list,
    claim,
    checkin,
}