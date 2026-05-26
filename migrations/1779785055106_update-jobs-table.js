/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.addColumns("jobs", {
    job_type: {
      type: "varchar(255)",
      notNull: true,
      default: "full-time",
    },
    experience_level: {
      type: "varchar(255)",
      notNull: true,
      default: "entry-level",
    },
    location_type: {
      type: "varchar(255)",
      notNull: true,
      default: "remote",
    },
    location_city: {
      type: "varchar(255)",
      notNull: true,
    },
    salary_min: {
      type: "integer",
      notNull: false,
      default: 0,
    },
    salary_max: {
      type: "integer",
      notNull: false,
      default: 0,
    },
    is_salary_visible: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    status: {
      type: "varchar(255)",
      notNull: true,
      default: "open",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropColumns("jobs", "job_type");
  pgm.dropColumns("jobs", "experience_level");
  pgm.dropColumns("jobs", "location_type");
  pgm.dropColumns("jobs", "location_city");
  pgm.dropColumns("jobs", "salary_min");
  pgm.dropColumns("jobs", "salary_max");
  pgm.dropColumns("jobs", "is_salary_visible");
  pgm.dropColumns("jobs", "status");
};
