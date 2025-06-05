const { Shift, Subject } = require('../db').models;

/* ---------- página com a tabela ---------- */
exports.list = (req, res) => {
  res.render('layout', { content: 'shiftList' });
};

/* ---------- JSON para o Tabulator ---------- */
exports.json = async (req, res, next) => {
  try {
    const page     = +req.query.page    || 1;
    const pageSize = +req.query.size    || 10;
    const filter   = (req.query.filter  || '').toLowerCase();

    /* WHERE name ILIKE '%filter%' */
    const where = filter
      ? { name: { [Op.iLike]: `%${filter}%` } }
      : {};

    const { count, rows } = await Shift.findAndCountAll({
      where,
      include:[{ model: Subject, as:'subject', attributes:['name'] }],
      order:[['id','ASC']],
      offset: (page-1)*pageSize,
      limit:  pageSize,
      raw:true, nest:true
    });

    res.json({
      data: rows.map(r => ({
        id        : r.id,
        name      : `${r.subject.name} – ${r.name}`,
        enrollment: r.enrollment,
      })),
      last_page: Math.ceil(count / pageSize)
    });

  } catch(err){ next(err); }
};
