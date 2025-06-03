// const axios = require("axios");
// const timetableService = require("../services/timetableService");
// controllers/algorithmController.js
const axios = require('axios');

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



// ──────────────────────────────────────────────────────────────
// NOVO  ▶  Gera horário
// ──────────────────────────────────────────────────────────────
exports.generate = async (req, res, next) => {
  try {
    // 1) ---- construir payload -------------------------------
    // Por agora hard-code. Depois troca por queries à tua BD.
    const buildPayload = () => {
      const starts  = ['08:00','09:30','11:00','14:00','15:30','17:00'];
      const BLOCK   = 1.5;          // horas p/ bloco
      const classes = [             // EXEMPLO mínimo
        { id: 1, name: 'Turma A', size: 30, year: 1, duration: 2, reqFeatures: [] },
        { id: 2, name: 'Turma B', size: 25, year: 2, duration: 1, reqFeatures: [] }
      ];
      const slots   = [];
      let id = 0;
      for (let wd = 0; wd < 5; wd++) {
        starts.forEach(st => {
          const [h,m] = st.split(':').map(Number);
          const end   = new Date(0,0,0,h,m + BLOCK*60)
                           .toTimeString().slice(0,5);
          slots.push({ id: id++, weekday: wd, start: st, end });
        });
      }
      const rooms = [
        { id: 1, name: 'Sala 1', capacity: 40, features: [] },
        { id: 2, name: 'Sala 2', capacity: 25, features: [] }
      ];
      return { classes, slots, rooms };
    };

    const payload = buildPayload();

    // 2) ---- chamar API Python -------------------------------
    const { data } = await axios.post(
      'http://localhost:8000/optimise',
      { data: payload },
      { timeout: 120000 }
    );

    // 3) ---- gravar na BD (placeholder) ----------------------
    // const run = await AlgorithmRun.create({ … });
    // await Promise.all(data.pareto.map(sol => Solution.create({ … })));

    // 4) ---- redireccionar para detalhe ----------------------
    // res.redirect(`/algorithm/${run.id}`);
    // Como não tens BD ainda, só mostra resultado bruto:
    res.json(data);

  } catch (err) {
    next(err);
  }
};

