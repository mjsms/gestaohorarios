// const axios = require("axios");
// const timetableService = require("../services/timetableService");

exports.list = async (req, res) => {
  // Placeholder: sem BD ainda
  const runs = [
    { id: 1, date: "2024-12-01 14:30", algorithm: "NSGA-II", hv: 0.78, count: 12 },
  ];

  res.render("layout", {
    content: "algorithm",     // ← ficheiro views/algorithm.ejs
    runs,
  });
};

exports.detail = async (req, res) => {
  const runId = req.params.id;

  const run  = { id: runId, algorithm: "NSGA-II", hv: 0.78 };
  const sols = [
    { id: "A", label: "Sol A", conflicts: 0, util: 83, gaps: 3, versionId: 10 },
    { id: "B", label: "Sol B", conflicts: 0, util: 80, gaps: 2, versionId: 11 },
  ];

  res.render("layout", {
    content: "algorithmDetail",   // views/algorithmDetail.ejs
    run,
    sols,
  });
};

exports.compare = async (req, res) => {
  res.render("layout", {
    content: "algorithmCompare",  // views/algorithmCompare.ejs
    runId: req.params.id,
    solIds: (req.query.ids || "").split(","),
  });
};
