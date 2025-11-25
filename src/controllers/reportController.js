const Report = require("../models/Report");

// Submit a new report
exports.createReport = async (req, res) => {
    try {
        const { title, description } = req.body;
        console.log(req.session.user.id);
        const report = new Report({
            title,
            description,
            user: req.session.user.id
        });

        await report.save();
        res.status(201).json({ message: "Report submitted successfully", report });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
};

// Get all reports (Admin only)
exports.getAllReports = async (req, res) => {
    try {
       const reports = await Report.find().populate("user", "firstName lastName email");
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
};

// Update report status (Admin only)
exports.updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        const report = await Report.findById(reportId);
        if (!report) return res.status(404).json({ message: "Report not found" });

        report.status = status;
        await report.save();

        res.status(200).json({ message: "Report status updated", report });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
};

// Get reports by user
exports.getUserReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.session.user.id });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
        console.log(error);
    }
};

// Delete a report (Admin only)
exports.deleteReport = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId);
        if (!report) return res.status(404).json({ message: "Report not found" });

        await report.deleteOne();
        res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
