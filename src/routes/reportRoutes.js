const express = require('express');
const {createReport, getAllReports, updateReportStatus, getUserReports, deleteReport
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnlyMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createReport); // User submits a report
router.get('/', authMiddleware, adminOnly, getAllReports); // Admin fetches all reports
router.put('/:reportId', authMiddleware, adminOnly, updateReportStatus); // Admin updates report status
router.get('/user', authMiddleware, getUserReports); // User fetches their own reports
router.delete("/:reportId", authMiddleware, adminOnly, deleteReport); // Admin deletes a report

module.exports = router;
