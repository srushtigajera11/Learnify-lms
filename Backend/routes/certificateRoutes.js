    const express = require('express');
const router = express.Router();
const {
    claimCertificate,
    getMyCertificates,
    getCertificateById,
    verifyCertificate,
    downloadCertificatePDF
}  = require('../controller/certificateController');


const {isAuthenticated , authorizeRoles} = require('../middleware/auth');
const debugCertificate = require('../controller/debugCertificate');
router.get('/debug/:courseId', isAuthenticated, debugCertificate);
router.post('/claim/:courseId',isAuthenticated,authorizeRoles('student'), claimCertificate);
router.get('/my-certificates',isAuthenticated,authorizeRoles('student'), getMyCertificates);
router.get('/:certificateId',isAuthenticated,authorizeRoles('student'), getCertificateById);
router.get(
  '/download/:certificateId',
  isAuthenticated,
  downloadCertificatePDF
);
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;