require("dotenv").config();
const amqplib = require("amqplib");
const nodemailer = require("nodemailer");
const pool = require("../database/pool");

const QUEUE_NAME = "application_notifications";

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const processMessage = async (payload) => {
  const { applicationId, jobId, applicantId } = payload;

  const result = await pool.query(
    `SELECT
       a.created_at      AS applied_at,
       u.name            AS applicant_name,
       u.email           AS applicant_email,
       j.title           AS job_title,
       owner.email       AS owner_email,
       owner.name        AS owner_name
     FROM applications a
     JOIN users     u     ON a.user_id     = u.id
     JOIN jobs      j     ON a.job_id      = j.id
     JOIN companies c     ON j.company_id  = c.id
     JOIN users     owner ON c.user_id     = owner.id
     WHERE a.id = $1`,
    [applicationId],
  );

  if (result.rows.length === 0) {
    console.error(
      `Application ${applicationId} not found, skipping notification`,
    );
    return;
  }

  const {
    applied_at,
    applicant_name,
    applicant_email,
    job_title,
    owner_email,
    owner_name,
  } = result.rows[0];

  const appliedDate = new Date(applied_at).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "long",
    timeStyle: "short",
  });

  await transporter.sendMail({
    from: `"OpenJob" <${process.env.MAIL_USER}>`,
    to: owner_email,
    subject: `Lamaran Baru untuk Posisi ${job_title}`,
    html: `
      <h2>Halo ${owner_name},</h2>
      <p>Ada kandidat baru yang melamar posisi <strong>${job_title}</strong>.</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td><strong>Nama Pelamar</strong></td>
          <td>${applicant_name}</td>
        </tr>
        <tr>
          <td><strong>Email Pelamar</strong></td>
          <td>${applicant_email}</td>
        </tr>
        <tr>
          <td><strong>Tanggal Lamaran</strong></td>
          <td>${appliedDate}</td>
        </tr>
      </table>
      <p>Silakan login ke OpenJob untuk meninjau lamaran ini.</p>
    `,
  });

  console.log(
    `Email notification sent to ${owner_email} for application ${applicationId}`,
  );
};

const startConsumer = async () => {
  const connection = await amqplib.connect(
    process.env.RABBITMQ_URL || "amqp://localhost",
  );
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  // Proses 1 pesan sekaligus
  channel.prefetch(1);

  console.log(`Consumer listening on queue: ${QUEUE_NAME}`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      console.log("Processing message:", payload);

      await processMessage(payload);

      channel.ack(msg);
    } catch (err) {
      console.error("Failed to process message:", err);
      // nack tanpa requeue supaya tidak loop terus
      channel.nack(msg, false, false);
    }
  });
};

startConsumer().catch(console.error);
