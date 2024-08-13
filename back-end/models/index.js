const TGUser = require('./TGUser');
const Earnings = require('./Earnings');
const CheckIns = require('./Checkin');

// Define associations
TGUser.hasOne(Earnings, { foreignKey: 'userid', sourceKey: 'userid' });
Earnings.belongsTo(TGUser, { foreignKey: 'userid', targetKey: 'userid' });

TGUser.hasOne(CheckIns, { foreignKey: 'userId', sourceKey: 'userid' });
CheckIns.belongsTo(TGUser, { foreignKey: 'userId', targetKey: 'userid'});

module.exports = {
    TGUser,
    Earnings,
    CheckIns,
};