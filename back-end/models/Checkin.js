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
                key: "userid", // Adjusted if 'id' is the primary key in tg_users
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
        tableName: "CheckIns", // Ensure this matches your actual table name
        timestamps: false,
        indexes: [{
            fields: ["userId"],
        }],
    }
);

module.exports = CheckIns;
