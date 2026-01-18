export const googleSchema = {
  type: 'object',
  required: ['email', 'email_verified', 'name', 'sub'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    email_verified: {
      type: 'boolean',
    },
    family_name: {
      type: 'string',
    },
    given_name: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    picture: {
      type: 'string',
    },
    sub: {
      type: 'string',
    },
  },
};

export const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      maxLength: 100,
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 50,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])',
    },
  },
};

export const resetPasswordSchema = {
  type: 'object',
  required: ['token', 'newPassword', 'code', 'email'],
  properties: {
    token: {
      type: 'string',
    },
    newPassword: {
      type: 'string',
      minLength: 8,
    },
    code: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
  },
};
