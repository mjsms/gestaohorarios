// const axios = require("axios");
// controllers/algorithmController.js
const axios = require('axios');
const timetableService = require("../services/timetableServices");
const { models, sequelize } = require('../db');

// controllers/algorithmController.js
exports.list = async (req, res, next) => {
  try {
    const runs = await models.AlgorithmRun.findAll({
      // ① campos base
      attributes: [
        'id',
        'algorithm',
        'hv',
        // ② data legível (PostgreSQL)
        [sequelize.fn(
          'to_char',
          sequelize.col('started_at'),
          'YYYY-MM-DD HH24:MI'
        ), 'date'],
        // ③ nº de soluções (sub-query COUNT)
        [sequelize.literal(`(
          SELECT COUNT(*) FROM "Solution" s
          WHERE s.run_id = "AlgorithmRun"."id"
        )`), 'solCnt']
      ],
      order:[['started_at','DESC']]
    });

    res.render('layout', { content:'algorithm', runs });

  } catch (err) { next(err); }
};



exports.detail = async (req, res, next) => {
  const run = await models.AlgorithmRun.findByPk(req.params.id, {
    include: [{ model: models.Solution, as: 'solutions' }],
    order:   [[{model: models.Solution, as:'solutions'}, 'conflicts', 'ASC']]
  });

  if(!run) return next(); // 404

  res.render('layout', {
    content : 'algorithmDetail',
    run,
    sols    : run.solutions
  });
};


// controllers/algorithmController.js
exports.compare = async (req, res, next) => {
  try {
    /* ------------------------------------------------------------------
       1) validar parâmetros
    ------------------------------------------------------------------ */
    const runId  = Number(req.params.id);
    const solIds = (req.query.ids || '')
                     .split(',')
                     .map(id => Number(id))
                     .filter(Boolean);

    if (solIds.length < 2) {
      // se o utilizador não escolheu pelo menos 2, volta ao detalhe
      return res.redirect(`/algorithm/${runId}`);
    }

    /* ------------------------------------------------------------------
       2) buscar soluções + alocações
         – garante que pertencem TODAS à mesma run
         – traz as alocações já para a comparação/heat-map
    ------------------------------------------------------------------ */
    const sols = await models.Solution.findAll({
      where: { id: solIds, run_id: runId },
      include: [{
        model: Allocation,
        as:    'allocations',
        attributes: ['class_id', 'slot_id', 'room_id']
      }],
      order: [['external_id', 'ASC']]
    });

    if (sols.length !== solIds.length) {
      // algum ID não existia ou pertencia a outra run → 404
      return next();               // usa o teu handler de 404
    }

    /* ------------------------------------------------------------------
       3) pré-processar para a view (ex.: matriz de comparação)
         – aqui só um exemplo simples
    ------------------------------------------------------------------ */
    const compMatrix = {};
    sols.forEach(sol => {
      sol.allocations.forEach(a => {
        const key = `${a.class_id}|${a.slot_id}`;   // um ponto da grade
        if (!compMatrix[key]) compMatrix[key] = {};
        compMatrix[key][sol.id] = a.room_id;       // sala que cada sol usa
      });
    });
    // agora compMatrix["123|7"] -> { 12: 4, 13: 6, … }

    /* ------------------------------------------------------------------
       4) render
    ------------------------------------------------------------------ */
    res.render('layout', {
      content: 'algorithmCompare',   // views/algorithmCompare.ejs
      runId,
      sols,                          // lista de modelos Solution
      compMatrix                     // estrutura pronta p/ heat-map
    });

  } catch (err) {
    next(err);
  }
};




exports.generate = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    /* 1) payload -------------------------------------------------------- */
    const payload    = await timetableService.buildPayload();
    const { classes, slots, rooms } = payload;   // ← rooms passa a existir aqui

    /* 2) chama a API ---------------------------------------------------- */
    const startedAt  = new Date();
    const apiResp    = await axios.post(
      process.env.OPTIMISER_URL || "http://localhost:8000/optimise",
      { data: payload, pop_size: 400, n_gen: 3 },
      { timeout: 9999999 }
    );
    const finishedAt = new Date();

    /* 3) persiste a run ------------------------------------------------- */
    const run = await models.AlgorithmRun.create({
      algorithm:  "NSGA-II",
      pop_size:   400,
      n_gen:      200,
      hv:         0,          
      started_at: startedAt,
      finished_at: finishedAt
    }, { transaction: t });

    /* 4) persiste cada solução + alocações ----------------------------- */
    for (const sol of apiResp.data.pareto) {
      // calcular já a utilização (simples: 1 - waste / capacidade_total)
      const totalCapacity = rooms.reduce((s,r)=>s+r.capacity,0) * slots.length;
      const utilisation   = 100 * (1 - sol.metrics.waste / totalCapacity);

      const solRow = await models.Solution.create({
        run_id:      run.id,
        external_id: sol.id,
        conflicts:   sol.metrics.conflicts,
        waste:       sol.metrics.waste,
        utilisation: utilisation.toFixed(2),
        gaps:        0               // ← por enquanto; 
    }, { transaction: t });

      // bulk insert das alocações
      const allocRows = sol.allocation.map(a => ({
        solution_id: solRow.id,
        class_id:    a.class_id,
        slot_id:     a.slot_id,
        room_id:     a.room_id
      }));
      await models.Allocation.bulkCreate(allocRows, { transaction: t });
    }
    await run.save({ transaction: t });
    await t.commit();
    return res.redirect(`/algorithm/${run.id}`);

  } catch (err) {
    console.error('SQL:', err.parent?.sql);
    console.error('DETAIL:', err.parent?.detail);
    await t.rollback();
    next(err);
  }
};

