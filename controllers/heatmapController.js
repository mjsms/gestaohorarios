// controllers/heatmapController.js
const { Schedule, ScheduleVersion, Subject, ClassRoom, Shift, ClassGroup } = require('../db').models;
const { startOfDay, startOfISOWeek, addDays, parse } = require('date-fns');
const { Op } = require('sequelize');          // <-- 1️⃣

const HOUR_START = 8;
const HOUR_END = 22;

// controllers/heatmapController.js
exports.page = (req, res) => {
  const { year, week } = req.query;           // ex.:  /heatmap?year=2024&week=23
  res.render('layout', {
    content : 'heatmap',
    initYear: year || null,
    initWeek: week || null,
  });
};

exports.data = async (req, res) => {
  try {
    const { year, week } = req.params;
    if (!year || !week) return res.status(400).json({ error: 'Parâmetros em falta' });

    /* 2️⃣ - Segunda-feira da ISO-semana --*/
    const weekStart = startOfISOWeek(
      parse(                                       // ex. "2022-W46"
        `${year}-W${String(week).padStart(2,'0')}`,
        "RRRR-'W'II",                             // RRRR = ano ISO, II = semana ISO
        new Date()
      )
    );
    const weekEnd = addDays(weekStart, 6);   // domingo 23:59

    const currentVersion = await ScheduleVersion.findOne({ where: { isCurrent: true } });

    const rows = await Schedule.findAll({
    where: {
        versionId: currentVersion.id,
        date: { [Op.between]: [weekStart, weekEnd] }
    },
    attributes: ['weekdayId', 'startTime', 'endTime'],
    include: [
        { model: ClassRoom, as: 'classRoom', attributes: ['name'] },

        { model: Shift, as: 'shift', attributes: ['name'],
        include: [
            { model: Subject,    as: 'subject',    attributes: ['name'] },
            { model: ClassGroup, as: 'classGroup', attributes: ['name'] },
        ]
        }
    ]
    });


    // matriz dia-hora
    const counts = [];
    for (let d = 1; d <= 7; d++) {
      for (let h = HOUR_START; h < HOUR_END; h++) counts.push({ x: d, y: h, v: 0 });
    }

    // d = 1-7   h = 8-21
    const slotKey = (d,h) => `${d}-${h}`;
    const slots = {};                      // { '2-14': [ {...}, {...} ], ... }

    rows.forEach(r => {
    const wd = ((r.weekdayId + 5) % 7) + 1;   // Monday=1 … Sunday=7
    const st = +r.startTime.split(':')[0];
    const et = +r.endTime.split(':')[0];

    for (let h = st; h < et; h++) {
        const key = slotKey(wd, h);
        if (!slots[key]) slots[key] = [];
            slots[key].push({
            subject : r.shift?.subject?.name      || '—',
            shift   : r.shift?.name               || '—',
            room    : r.classRoom?.name           || '—',
            group   : r.shift?.classGroup?.name   || '—',
            });
        const cell = counts.find(c => c.x === wd && c.y === h);
        if (cell) cell.v += 1;                 
    }
    });

    res.json({ data: counts, details: slots, weekStart, weekEnd });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter dados do heatmap' });
  }
};
