/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // users table
  pgm.createTable("users", {
    id: { type: "varchar(50)", primaryKey: true },
    name: { type: "varchar(255)", notNull: true },
    email: { type: "varchar(255)", notNull: true, unique: true },
    password: { type: "text", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // companies table
  pgm.createTable("companies", {
    id: { type: "varchar(50)", primaryKey: true },
    name: { type: "varchar(255)", notNull: true },
    description: { type: "text", notNull: false },
    logo_url: { type: "varchar(255)", notNull: false },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // categories table
  pgm.createTable("categories", {
    id: { type: "varchar(50)", primaryKey: true },
    name: { type: "varchar(255)", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Jobs table
  pgm.createTable("jobs", {
    id: { type: "varchar(50)", primaryKey: true },
    title: { type: "varchar(255)", notNull: true },
    description: { type: "text", notNull: true },
    company_id: {
      type: "varchar(50)",
      notNull: true,
      references: '"companies"',
      onDelete: "CASCADE",
    },
    category_id: {
      type: "varchar(50)",
      notNull: true,
      references: '"categories"',
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // documents table
  pgm.createTable("documents", {
    id: { type: "varchar(50)", primaryKey: true },
    user_id: {
      type: "varchar(50)",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    file_name: { type: "varchar(255)", notNull: true },
    file_url: { type: "text", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  //  applications table
  pgm.createTable("applications", {
    id: { type: "varchar(50)", primaryKey: true },
    user_id: {
      type: "varchar(50)",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    job_id: {
      type: "varchar(50)",
      notNull: true,
      references: '"jobs"',
      onDelete: "CASCADE",
    },
    document_id: {
      type: "varchar(50)",
      notNull: false,
      references: '"documents"',
      onDelete: "SET NULL",
    },
    status: {
      type: "varchar(50)",
      notNull: true,
      default: "PENDING",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // bookmarks table
  pgm.createTable("bookmarks", {
    id: { type: "varchar(50)", primaryKey: true },
    user_id: {
      type: "varchar(50)",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    job_id: {
      type: "varchar(50)",
      notNull: true,
      references: '"jobs"',
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  //   Contstrait agar bookmark selalu unik
  pgm.addConstraint("bookmarks", "unique_bookmark_user_job", {
    unique: ["user_id", "job_id"],
  });

  // authentications
  pgm.createTable("authentications", {
    token: { type: "text", notNull: true, primaryKey: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("authentications");
  pgm.dropTable("bookmarks");
  pgm.dropTable("applications");
  pgm.dropTable("documents");
  pgm.dropTable("jobs");
  pgm.dropTable("categories");
  pgm.dropTable("companies");
  pgm.dropTable("users");
};
