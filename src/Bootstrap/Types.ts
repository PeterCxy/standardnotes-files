const TYPES = {
  Logger: Symbol.for('Logger'),
  HTTPClient: Symbol.for('HTTPClient'),
  ValetKeyGenerator: Symbol.for('ValetKeyGenerator'),

  // use cases
  CreateValetKey: Symbol.for('CreateValetKey'),

  // env vars
  S3_BUCKET_NAME: Symbol.for('S3_BUCKET_NAME'),
  JWT_SECRET: Symbol.for('JWT_SECRET'),
  VALET_TOKEN_SECRET: Symbol.for('VALET_TOKEN_SECRET'),
  Crypter: Symbol.for('Crypter'),
  SNCrypto: Symbol.for('SNCrypto'),
}

export default TYPES
