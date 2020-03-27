const nedb = require('nedb');
var db = new nedb({ filename : 'users.db', autoload: true });

db.find({}, (err, docs) => {
    if (docs && docs.length < 1) {
        insertUser('netbug', true, true)
    }
});

async function checkUser(username) {
    return new Promise((res, rej) => {
        db.find({ id: username }, (err, docs) => {
            if (err) rej(err);
            if (!docs.length) res(false);
            res(docs[0]);
        });
    });
}

function insertUser(name, isAdmin=false, isAllowed=false) {
    db.insert({ id: name, admin: isAdmin, allowed: isAllowed }, (err, doc) => {
        if (err)
            console.error(`Could not create user ${name}: ${err}`); 
        console.debug(`User ${JSON.stringify(doc)} successfully created!`);
    });
}

async function listUsers() {
    return new Promise((res, rej) => {
        db.find({}, (err, docs) => {
            if (err) rej(err);
            res(docs);
        });
    });
}

function updateuser(user, isAllowed) {
    db.update({ id: user }, { $set: { allowed: isAllowed } }, { multi: true }, function (err, numReplaced) {
        if (err) console.error(err);
        console.log(`Updated ${numReplaced} users found as ${user} to allowed=${isAllowed}`);
      });
}

module.exports = { checkUser, insertUser, listUsers, updateuser };
