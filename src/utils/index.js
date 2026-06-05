const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  24,
);

const generateId = () => nanoid();

const formatApplication = (row) => ({
  id: row.id,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
  user_id: row.user_id,
  user: {
    id: row.user_id,
    name: row.user_name,
    email: row.user_email,
  },
  job_id: row.job_id,
  job_title: row.job_title,
  job_description: row.job_description,
  job_location_city: row.job_location,
  job: {
    id: row.job_id,
    title: row.job_title,
    description: row.job_description,
    location_city: row.job_location,
    company: {
      id: row.company_id,
      name: row.company_name,
    },
  },
  document_url: row.document_file_url,
  document: row.document_id
    ? {
        id: row.document_id,
        file_name: row.document_file_name,
        original_name: row.document_original_name,
        file_url: row.document_url,
      }
    : null,
});

module.exports = { generateId, formatApplication };
