const bcrypt = require("bcryptjs")
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User; // to be defined on new connection (see initialize) 

module.exports.initialize = function(){
    return new Promise(function(resolve, reject){
       let pass1 = encodeURIComponent("Dar4b72!");
       let db=mongoose.createConnection(`mongodb+srv://dchan68:${pass1}@senecaweb-vaqqv.mongodb.net/web322_assignment6?retryWrites=true&w=majority`);
       
       db.on('error', (err)=>{
           reject(err); 
       });
       db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
       });
    });
};

module.exports.registerUser = function (userData){
    return new Promise(function(resolve, reject){
        if (userData.password == userData.password2){
            let newUser = new User(userData);
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(userData.password, salt, function (err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password");
                    }
                    else {
                        newUser.password = hash; //user password replaced with its hashed version
                        newUser.save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code == 11000) {
                                reject("User Name already taken");
                            }
                            else {
                                reject("There was an error creating the user:" + err);
                            }
                        });
                    }
                });
            });
        } else {
          reject("Passwords do not match")
        }
    });
}

module.exports.checkUser = function(userData){
    return new Promise((resolve, reject)=>{
      User.find({userName: userData.userName})
    })
    .exec()
    .then((user)=>{
      if (user.length==0){
        reject("Unable to find user: "+ userData.userName);
      }else{
        User.find({password: userData.password})
        .exec()
        .then((user)=>{
          if (user[0].password != userData.password){
            reject (`Incorrect Password for user: ${userData.userName}`);
          }
          else{
            bcrypt.compare("myPassword123", hash).then((res)=>{
              if (res===true){
                resolve();
                users[0].loginHistory.push({
                  dateTime: (new Data()).toString(),
                  userAgent: userData.userAgent
                });
                User.update({ userName: users[0].userName},
                {$set: {loginHistory: users[0].loginHistory}},
                {multi: false})
                .exec().then((()=>{
                  resolve(users[0]);
                })).catch((err)=>{
                  reject(`There was an error verifying the user: ${err}`);
                })
              }else{
                reject (`Incorrect Password for user: ${userData.userName}`);
              }
            })
          }
        }).catch(()=>{
          reject(`Unable to find user: ${userData.userName}`);
        })
      }
    })
  }
