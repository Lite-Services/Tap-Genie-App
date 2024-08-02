const { sequelize } = require("../config/mysql-sequelize");
const { getUTCTime } = require("../utils/helperfun");
const { Op, col } = require("sequelize");

const Earnings = require("../models/Earnings");
const TGUser = require("../models/TGUser");

// TODO : Remove the console in production
async function getscore(req, res, next) {
    try {
        const { user: tgUser } = req;

        if (!tgUser || tgUser.id == null) {
            
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }

        const userDetails = await Earnings.findOne({ where: { userid: tgUser.id } });

        if (userDetails) {
            const value = {
                checkin_score: userDetails.checkin_score,
                miner_points: userDetails.miner_points,
                referral_score: userDetails.referral_score,
                tap_score: userDetails.tap_score,
                enery_restore_time: userDetails.enery_restore_time,
                energy_remaning: userDetails.energy_remaning,
                game_level: userDetails.miner_level,
            };
            console.log(value);
            return res.status(200).json({ message: 'Success', data: value });
        } else {
            return res.status(200).json({ message: 'Success', data: [] });
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
        return next(new Error('An error occurred while retrieving the score'));
    }
}

async function upscore(req, res, next) {
    try {
        const { score, energy_remaning, restore_time } = req.body;

        const tgUser = req.user;

        if (!tgUser || !tgUser.id) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }

        const { id: teleid } = tgUser;

        const userDetails = await Earnings.findOne({ where: { userid: teleid } });

        // TODO: Add score validation

        const updata = {
            tap_score: parseInt(score),
            energy_remaning: energy_remaning,
            enery_restore_time: restore_time,
            modified_date: getUTCTime("datetime"),
        };

        if (userDetails) {
            const [updated] = await Earnings.update(updata, { where: { userid: teleid } });
            if (updated > 0) {
                return res.status(200).json({ message: 'Success', data: [] });
            } else {
                return res.status(409).json({ error: 'Conflict', message: 'Score update failed' });
            }
        } else {
            return res.status(422).json({ error: 'Unprocessable Entity', message: 'Validation failed for the input data' });
        }
    } catch (error) {
        console.error("Error updating points:", error);
        return next(new Error('An error occurred while updating the score'));
    }
}

module.exports = {
    getscore,
    upscore
};
