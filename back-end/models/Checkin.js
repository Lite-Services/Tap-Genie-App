const {
    sequelize,
    DataTypes,
} = require("../config/mysql-sequelize");

const CheckIns = sequelize.define(
    "CheckIns", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: "tg_users",
                key: "userid",
            },
        },
        checkInDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        rewardPoints: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        streak: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        tableName: "checkins",
        timestamps: false,
        indexes: [{
            fields: ["userId"], // Corrected from "userid" to "userId"
        }],
        hooks: {
            beforeUpdate: (checkIn, options) => {
                // Ensure modifyDate is a valid field or remove this hook if not needed
                checkIn.modifyDate = new Date(); // Corrected the typo
            },
        },
    }
);

module.exports = CheckIns;
