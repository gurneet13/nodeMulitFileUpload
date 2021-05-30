const json2csv = require('json2csv').parse;
const fs = require('fs');
const path = require('path');

const { workerData, parentPort } = require("worker_threads");

const write = async ({fileName, fields, data,...workerData}) => {
    // output file in the same folder
    const filename = path.join(__dirname, '../CSV', `${fileName}`);
    let rows;
    // If file doesn't exist, we will create new file and add rows with headers.    
    if (!fs.existsSync(filename)) {
        rows = json2csv(data, { header: true });
    } else {
        // Rows without headers.
        rows = json2csv(data, { header: false });
    }
    let response = null;
    // Append file function can create new file too.
    response = await fs.appendFileSync(filename, rows);
    // Always add new line if file already exists.
    response = fs.appendFileSync(filename, "\r\n");
}

write(workerData);

module.exports = {
  write
};
