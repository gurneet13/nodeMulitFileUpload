const workerHelper = require("./mainWorker");
const fs = require('fs');
const csv = require("csvtojson");

const checkAndCreate = async (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const upload = async (file, type = "create", userInfo = {}) => {

  return new Promise(async (resolve, reject) => {
    const readStream = fs.createReadStream(file.path);
    const uploadDir = `${__dirname}/../CSV/`;
    const uploadFile = `${uploadDir}/${file.name}`;
    await checkAndCreate(uploadDir);
    const writeStream = fs.createWriteStream(uploadFile);
    const stream = readStream.pipe(writeStream);
    // Converting pipe into promise
    const pipe = (stream) =>
      new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

    pipe(stream)
      .then(async () => {
        const usedSheets = await csv({
          noheader: true,
          output: "csv",
        }).fromFile(uploadFile);

        let fieldNames = usedSheets[0];
        usedSheets.shift();

        //checkLead(usedSheets);
        finalMfields = ["text", "intent"];
        if (type == "userDelete") {
          finalMfields = ["userName"];
        }
        let mfields = finalMfields;
        let mTmp = {};
        let i = 0;
        let mIndex = -1;
        let j = 0;
        let tmp = [];

        fieldNames = fieldNames.filter(function (el) {
          return el != "";
        });
        //check if these 5 fields exist in main fields array
        for (let field of mfields) {
          if (!fieldNames.includes(field)) {
            return reject({
              statusCode: 404,
              success: false,
              msg: "Invalid columns.Please Check",
            });
          }
        }
        //loop through multiple sheets! if any.
        for (sheet of usedSheets) {
          i = 0;
          let needTOAdd = true;

          for (let mFiled of fieldNames) {
            if (!mfields.includes(mFiled)) {
              var key = fieldNames[i];
              j++;
              if (mIndex == -1) mIndex = i;
              if (key !== undefined && key !== "" && sheet[i] !== "") {
                mTmp[key] = sheet[i];
              }
            } else {
              var key = mFiled;
              if (key !== undefined && key !== "" && sheet[i] !== "") {
                mTmp[key] = sheet[i];
              }
            }
            i++;
          }
          if (mIndex != -1) {
            sheet.splice(mIndex, j);
          }
          if (needTOAdd) {
            //checking if the object has value for each of its unique fields
            for (let column of mfields) {
              //retrive keys from the row object
              let columnsFromCSV = Object.keys(mTmp);
              //check for empty row values
              if (!columnsFromCSV.includes(column)) {
                return reject({
                  statusCode: 404,
                  success: false,
                  msg: "Empty Row Or Wrong Format.Please Check",
                });
              }
            }
            tmp.push(mTmp);
            mTmp = {};
          }
        }
        console.log("Data", tmp);
        if (type === "create") {

          const trainData = {
            fileName: 'train.csv',
            fields: ['text','intent'],
            data: tmp
          };
          workerHelper.mainWorkerThreadCall(trainData);

          const testData = {
            fileName: 'test.csv',
            fields: ['text','intent'],
            data: tmp
          };
          workerHelper.mainWorkerThreadCall(testData);
          
          const validData = {
            fileName: 'valid.csv',
            fields: ['text','intent'],
            data: tmp
          };
          workerHelper.mainWorkerThreadCall(validData);
          //console.log(trainDataFromWorker,testDataFromWorker,validDataFromWorker)

        } else if (type === "userDelete") {
          //bulkDeleteUsers(tmp, userInfo);
        } else if (type === "delete") {
          //bulkDeleteAgentSkillMapping(tmp, userInfo);
        }
        resolve({
          statusCode: 200,
          success: true,
          msg: "uploaded successfully",
        });
      })
      .catch((e) => {
        console.log("Error", e);
        reject({ statusCode: 400, success: false, msg: "uploaded error" });
      });
  });
};

module.exports = {
  upload
};