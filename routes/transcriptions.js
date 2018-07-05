var express = require('express');
var router = express.Router();
var token = require('../controllers/accessTokens')
var transcriptions = require('../controllers/transcriptions')
/* GET home page. */
router.post('/upload/:userId', token.validateParamToken, transcriptions.uploadFile);
router.post('/uploadInterview/:user',transcriptions.uploadAudio);
router.get('/getInterview/:interview',transcriptions.fetchAudio);
//router.post('//:userId', token.validateParamToken, transcriptions.uploadFile);
router.post('/fetchLiveRecordingData/:transcriptionsId/:userId', token.validateParamToken, transcriptions.fetchLiveRecordingData);
router.post('/fetchLiveRecordingData/:transcriptionsId/:userId/:type', token.validateParamToken, transcriptions.fetchLiveRecordingData);
router.get('/startLiveRec/:patientId/:userId', token.validateParamToken, transcriptions.startLiveRec);
router.get('/saveDuration/:transcript/:duration',transcriptions.saveDuration);
router.get('/getTranscript/:transcript',transcriptions.getTranscript);
module.exports = router;
