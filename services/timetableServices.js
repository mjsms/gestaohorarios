// services/timetableService.js
const {
  Shift, Subject,
  ClassRoom, Feature,
  Schedule, ScheduleVersion
} = require("../db").models;
const { sequelize } = require("../db");

exports.buildPayload = async () => {

  /* ------------------------------------------------------------------
     0) descobrir a versão actual
     ------------------------------------------------------------------ */
  const currentVersion = await ScheduleVersion.findOne({
    where: { isCurrent: true },
    attributes: ["id"]
  });
  if (!currentVersion)
    throw new Error("⚠️  Nenhuma ScheduleVersion marcada como isCurrent=true");

  const vId = currentVersion.id;

  /* ------------------------------------------------------------------
     1) CLASSES  (cada Shift que aparece na versão actual)
     ------------------------------------------------------------------ */
    const shifts = await Shift.findAll({
    attributes: [
        'id', 'name', 'enrollment',          // colunas de Shift
        [sequelize.col('subject.name'), 'subjectName']
    ],
    include: [
        {
        model: Schedule, as: 'schedules',
        required: true,
        attributes: [],                  // já não precisamos de colunas
        include: [{
            model: ScheduleVersion, as: 'version',
            where: { id: vId },
            attributes: []
        }]
        },
        { model: Subject, as: 'subject', attributes: [] }
    ],
    group: ['Shift.id', 'subject.name'], // 👈 força DISTINCT por Shift
    raw: true
    });


    const classes = shifts.map(s => ({
    id:   s.id,
    name: `${s.subjectName} – ${s.name}`,
    size: s.enrollment || 20,
    year: s.year       || 1,
    duration:   1,
    reqFeatures: []
    }));

  /* ------------------------------------------------------------------
     2) ROOMS  (salas que aparecem em schedules dessa versão)
     ------------------------------------------------------------------ */
  const roomsRaw = await ClassRoom.findAll({
    include: [
      {
        model: Schedule, as: "schedules",          // ClassRoom.hasMany(Schedule)
        required: true,
        attributes: [],
        include: [
          { model: ScheduleVersion, as: "version", where: { id: vId }, attributes: [] }
        ]
      },
      {                                            // características da sala
        model: Feature,
        as: "Features",                            // alias gerado pelo belongsToMany
        attributes: ["name"],
        through: { attributes: [] }                // ignora tabela ponte
      }
    ],
    raw: true, nest: true
  });

  // → agregamos porque o raw+nest devolve 1 linha por (sala × feature)
  const byId = {};
  roomsRaw.forEach(r => {
    if (!byId[r.id]) {
      byId[r.id] = {
        id:       r.id,
        name:     r.name,
        capacity: r.capacity,
        features: []
      };
    }
    if (r.Features && r.Features.name) {
      byId[r.id].features.push(r.Features.name);
    }
  });
  const rooms = Object.values(byId);

  /* ------------------------------------------------------------------
     3) SLOTS  (continuamos a gerá-los em memória - pb fixo)
     ------------------------------------------------------------------ */
  const starts = ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"];
  const BLOCK  = 1.5;      // horas por bloco
  const slots  = [];
  let id = 0;
  for (let wd = 0; wd < 5; wd++) {
    starts.forEach(st => {
      const [h, m] = st.split(":").map(Number);
      const end = new Date(0, 0, 0, h, m + BLOCK * 60)
                    .toTimeString().slice(0, 5);
      slots.push({ id: id++, weekday: wd, start: st, end });
    });
  }

  /* ------------------------------------------------------------------
     4) devolver payload
     ------------------------------------------------------------------ */
  return { classes, slots, rooms };
};
