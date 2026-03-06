// In-memory job store with TTL cleanup

const jobs = new Map();
const JOB_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_RENDERS) || 2;

let activeCount = 0;

function createJob(id, data) {
  jobs.set(id, {
    id,
    status: 'queued',
    progress: 0,
    output_url: null,
    error: null,
    data,
    createdAt: Date.now(),
  });
  return jobs.get(id);
}

function getJob(id) {
  return jobs.get(id) || null;
}

function updateJob(id, updates) {
  const job = jobs.get(id);
  if (!job) return null;
  Object.assign(job, updates);
  return job;
}

function canAcceptJob() {
  return activeCount < MAX_CONCURRENT;
}

function incrementActive() {
  activeCount++;
}

function decrementActive() {
  activeCount = Math.max(0, activeCount - 1);
}

// Clean up expired jobs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) {
      jobs.delete(id);
    }
  }
}, 10 * 60 * 1000);

module.exports = { createJob, getJob, updateJob, canAcceptJob, incrementActive, decrementActive };
