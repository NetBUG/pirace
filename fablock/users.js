const nedb = require('nedb');
var db = new nedb({ filename : 'users.db', autoload: true });

db.find({}, (err, docs) => {
    console.log('Users:');
    console.log(docs);
    if (docs && docs.length < 1) {
        insertUser('netbug', true)
    }
});

async function checkUser(username) {
    return new Promise((res, rej) => {
        db.find({ id: username }, (err, docs) => {
            if (err) rej(err);
            if (!docs.length) return false;
            return docs[0];
        });
    });
}

function insertUser(name, isAdmin=false) {
    db.insert({ id: name, admin: isAdmin, allowed: true }, (err, doc) => {
        if (err)
            console.error(`Could not create user ${name}: ${err}`); 
        console.debug(`User ${JSON.stringify(doc)} successfully created!`);
    });
}

module.exports = { checkUser };
