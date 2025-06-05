const { ICalCalendar } = require('ical-generator');
const moment = require('moment-timezone');
const {
  ScheduleVersion, Schedule, Shift,
  Subject, ClassRoom
} = require('../db').models;

exports.classFeed = async (req, res, next) => {
  try {
    const shiftId = Number(req.params.id);
    if (!shiftId) return res.status(400).send('Bad shift ID');

    const currVer = await ScheduleVersion.findOne({ where: { isCurrent: true } });
    if (!currVer) return res.status(404).send('Nenhuma versão actual');

    const shift = await Shift.findByPk(shiftId, {
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    });
    if (!shift) return res.status(404).send('Turma não encontrada');

    const schedules = await Schedule.findAll({
      where: { shiftId, versionId: currVer.id },
      include: [{ model: ClassRoom, as: 'classRoom', attributes: ['name'] }],
      raw: true, nest: true
    });
    if (!schedules.length) return res.status(404).send('Sem aulas nesta versão');

    const cal = new ICalCalendar({
      name: `Horário • ${shift.subject.name} – ${shift.name}`,
      prodId: '//ISCTE//Scheduler//PT',
      timezone: 'Europe/Lisbon'
    });

    // helper: DB → string “MO/TU/…” para RRULE
    const wd = id => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][id % 7];

    const seen = new Set();

    schedules.forEach(s => {
      const key = `${s.weekdayId}-${s.startTime}-${s.endTime}-${s.classRoom?.name}`;
      if (seen.has(key)) return; // já geraste este bloco
      seen.add(key);

      const weekday = s.weekdayId;
      const startParts = s.startTime.split(':').map(Number);
      const endParts = s.endTime.split(':').map(Number);

      const firstDay = moment.tz('Europe/Lisbon').day(weekday);
      if (firstDay.isBefore(moment())) firstDay.add(1, 'week');

      const start = firstDay.clone().hour(startParts[0]).minute(startParts[1]);
      const end = firstDay.clone().hour(endParts[0]).minute(endParts[1]);

      cal.createEvent({
        id: `shift-${shiftId}-${key}`,
        summary: shift.subject.name,
        location: s.classRoom?.name || 'TBD',
        description: `Aula da turma ${shift.name}`,
        start: start.toDate(),
        end: end.toDate(),
        repeating: {
          freq: 'WEEKLY',
          byDay: [wd(weekday)],
          until: moment(start).add(4, 'months').toDate()
        }
      });
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="shift-${shiftId}.ics"`);
    res.send(cal.toString());
  } catch (err) {
    next(err);
  }
};
