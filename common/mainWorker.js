const mainWorkerThreadCall = async (tData) => {

  return new Promise(async (resolve, reject) => {
    try {
      const { Worker, isMainThread } = require("worker_threads");
      console.log("worker_threads is found");
      if (isMainThread) {
        const worker = new Worker(
          `./common/writeToFiles.js`,
          {
            workerData: tData,
          }
        );
        worker.on("message", (msg) => {
          resolve(msg);
        });
        worker.on("online", () => {
          console.log("worker is online", new Date());
        });
        worker.on("error", (error) => {
          console.log("error", error);
          reject(error);
        });
        worker.on("exit", (code) => {
          console.log("worker thread exit with code", code);
          if (code !== 0) {
            console.log(new Error(`Worker stopped with exit code ${code}`));
            reject(code);
          }
        });
      }
    } catch (e) {
      console.error("worker_threads is not found");
      const urlGen = require("./common/writeToFiles");
      let data1 = await urlGen.write("test.csv",['text','intent'],tData);     
      let data2 = await urlGen.write("train.csv",['text','intent'],tData); 
      let data3 = await urlGen.write("valid.csv",['text','intent'],tData); 
      if (data1 && data2 && data3) {
        resolve({data1:data1, data2:data2, data3:data3});
      } else {
        reject("download fail non worker thread");
      }
    }
  });
};

module.exports = {
  mainWorkerThreadCall,
};
