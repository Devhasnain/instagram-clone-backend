const z = require("zod");

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const registerSchema = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
});


module.exports = {
    loginSchema,
    registerSchema
}