const utils = require('../common/util');
const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const shell = require('shelljs');

router.post('/uploadTrainingData', async (req, res) => {
   const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, response) => {
      if (err) {
        console.log('Training Data Upload Err', err);
        res.status(400).json({ success: false, msg: 'file upload error' });
        return;
      }
      console.log("RESPONSE FROM FILE", response)
      if (!response || !response.file || !response.file.name || response.file.name.search('csv') === -1) {
        res.status(400).json({ success: false, msg: 'Invalid file Extention.' });
        return;
      }

      console.log('fields', fields);
      console.log('response', response);
      utils.upload(response.file, "create", req.user)
        .then((result) => {
          console.log("result got is", result)
          return res.status(result.statusCode).json(result);
        })
        .catch(e => {
          res.json(e)
        })
    });
});

router.get("/train",(req,res)=>{
  shell.exec('pm2 restart BERT', function(code, output) {
      console.log('Exit code:', code);
      console.log('Program output:', output);
    });
    res.send({
        status:"success"
    })
});


module.exports = router;