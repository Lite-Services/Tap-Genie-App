const TGUser = require('./TGUser');
const Earnings = require('./Earnings');
const CheckIns = require('./Checkin');

// Define associations
TGUser.hasOne(Earnings, { foreignKey: 'userid', sourceKey: 'userid' });
Earnings.belongsTo(TGUser, { foreignKey: 'userid', targetKey: 'userid' });
CheckIns.belongsTo(TGUser, { foreignKey: 'userid', targetKey: 'userId'});

module.exports = {
    TGUser,
    Earnings,
    CheckIns,
};