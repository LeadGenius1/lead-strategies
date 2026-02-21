// Request validation middleware using Zod
const { z } = require('zod');

/**
 * Validate request body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns Express middleware
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate query parameters against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: result.error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
    }
    req.query = result.data;
    next();
  };
}

// ========================
// Common validation schemas
// ========================

const schemas = {
  login: z.object({
    email: z.string().email('Invalid email address').max(255).transform(s => s.toLowerCase().trim()),
    password: z.string().min(1, 'Password is required').max(200),
  }),

  signup: z.object({
    email: z.string().email('Invalid email address').max(255).transform(s => s.toLowerCase().trim()),
    password: z.string().min(8, 'Password must be at least 8 characters').max(200),
    name: z.string().max(100).optional(),
    company: z.string().max(200).optional(),
    tier: z.string().max(50).optional(),
    businessInfo: z.record(z.unknown()).optional(),
  }),

  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().max(50).optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  uuid: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
};

module.exports = { validateBody, validateQuery, schemas, z };
