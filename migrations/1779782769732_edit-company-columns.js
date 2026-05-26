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
  pgm.alterColumn("companies", "location", {
    type: "varchar(255)",
    notNull: true,
  });

  pgm.alterColumn("companies", "description", {
    type: "text",
    notNull: true,
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.alterColumn("companies", "location", {
    type: "varchar(255)",
    notNull: false,
  });

  pgm.alterColumn("companies", "description", {
    type: "text",
    notNull: false,
  });
};
