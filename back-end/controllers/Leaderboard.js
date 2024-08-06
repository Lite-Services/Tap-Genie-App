const { sequelize } = require("../config/mysql-sequelize");
const { Op } = require("sequelize");

const Earnings = require("../models/Earnings");
const TGUser = require("../models/TGUser");

async function allrank(req, res, next) {
    try {
        const { tid } = req.query; // Get tid from query parameters

        // Authentication check
        if (!tid) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
        }

        // Query to get all users' ranks
        console.log("Executing query to get top users");
        const [results] = await sequelize.query(`
            SELECT e.tap_score, t.username, e.game_level, e.id, t.first_name 
            FROM tg_users AS t
            JOIN earnings AS e ON t.userid = e.id AND e.tap_score != 0
            ORDER BY e.tap_score DESC
        `);

        console.log("Top users query results:", results);

        const topUsers = results;

        if (topUsers.length === 0) {
            return res.status(404).json({ error: 'No users found', message: 'No user data available' });
        }

        // Mapping user data
        const topplayers = topUsers.map(user => ({
            id: user.id,
            firstname: user.first_name,
            username: user.username,
            overallPoints: user.tap_score,
            gameLevel: user.game_level,
        }));

        // If needed, additional user details
        let specificUserDetails = null;
        let userPosition = null;

        if (tid) {
            console.log("Executing query to get specific user details");
            const [specificUserResults] = await sequelize.query(`
                SELECT e.tap_score, t.username, e.game_level, e.id, t.first_name 
                FROM tg_users AS t
                JOIN earnings AS e ON t.userid = e.id
                WHERE t.userid = ?
                ORDER BY e.tap_score DESC
            `, { replacements: [tid], type: sequelize.QueryTypes.SELECT });

            console.log("Specific user details query results:", specificUserResults);

            if (specificUserResults.length > 0) {
                const specificUser = specificUserResults[0];
                specificUserDetails = {
                    id: specificUser.id,
                    firstname: specificUser.first_name,
                    username: specificUser.username,
                    overallPoints: specificUser.tap_score,
                    gameLevel: specificUser.game_level,
                };

                // Calculate user position
                console.log("Calculating user position");
                const userRank = await Earnings.count({
                    where: {
                        tap_score: {
                            [Op.gt]: specificUser.tap_score,
                        },
                    },
                });
                userPosition = userRank + 1;
            }
        }

        console.log("Top Players:", topplayers);
        console.log("User Details:", specificUserDetails);
        console.log("User Position:", userPosition);

        return res.status(200).json({
            isthere: true,
            message: "success",
            value: { topplayers, specificUserDetails, userPosition },
        });
    } catch (error) {
        console.error("Error fetching rankings:", error);
        return res.status(500).json({ error: 'Internal server error', message: 'An error occurred while fetching rankings' });
    }
}

module.exports = {
    allrank
};
