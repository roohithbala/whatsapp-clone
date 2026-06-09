const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Guard all endpoints under /api/admin with verifyToken and verifyAdmin
router.use(verifyToken, verifyAdmin);

// Admin Moderation Endpoints
router.get("/reports", adminController.getReports);
router.post("/reports/:reportId/resolve", adminController.resolveReport);
router.post("/users/:userId/toggle-suspend", adminController.toggleSuspendUser);
router.get("/users", adminController.getUsersList);

// Ban Appeal Endpoints
router.get("/appeals", adminController.getAppeals);
router.post("/appeals/:appealId/approve", adminController.approveAppeal);
router.post("/appeals/:appealId/deny", adminController.denyAppeal);

module.exports = router;

