import express from 'express';
import {
    listPhoneNumbers,
    addPhoneNumber,
    getPhoneStatus,
    requestVerificationCode,
    verifyCode,
    resetOtpStatus,
    unlinkPhoneNumber,
    updatePhoneName,
    getBusinessProfile,
    updateBusinessProfile,
    listWabas,
    createWaba
} from './meta-connections.js';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const router = express.Router();

router.get('/phone_numbers', listPhoneNumbers);
router.post('/phone_numbers', addPhoneNumber);
router.get('/status/:phone_id', getPhoneStatus);
router.post('/request_code', requestVerificationCode);
router.post('/verify_code', verifyCode);
router.post('/reset_otp', resetOtpStatus);
router.post('/unlink', unlinkPhoneNumber);
router.post('/update_name/:phone_id', updatePhoneName);
router.get('/profile/:phone_id', getBusinessProfile);
router.post('/update_business_profile/:phone_id', updateBusinessProfile);
router.get('/wabas', listWabas);
router.post('/wabas', createWaba);

app.use('/api/meta', router);
app.use('/', router); 

export default app;
