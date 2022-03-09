const TYPES = {
  Logger: Symbol.for('Logger'),
  HTTPClient: Symbol.for('HTTPClient'),
  Redis: Symbol.for('Redis'),
  S3: Symbol.for('S3'),
  SNS: Symbol.for('SNS'),

  // use cases
  UploadFileChunk: Symbol.for('UploadFileChunk'),
  StreamDownloadFile: Symbol.for('StreamDownloadFile'),
  CreateUploadSession: Symbol.for('CreateUploadSession'),
  FinishUploadSession: Symbol.for('FinishUploadSession'),
  GetFileMetadata: Symbol.for('GetFileMetadata'),
  RemoveFile: Symbol.for('RemoveFile'),

  // services
  ValetTokenDecoder: Symbol.for('ValetTokenDecoder'),
  Timer: Symbol.for('Timer'),
  DomainEventFactory: Symbol.for('DomainEventFactory'),
  DomainEventPublisher: Symbol.for('DomainEventPublisher'),
  FileUploader: Symbol.for('FileUploader'),
  FileDownloader: Symbol.for('FileDownloader'),
  FileRemover: Symbol.for('FileRemover'),

  // repositories
  UploadRepository: Symbol.for('UploadRepository'),

  // middleware
  ValetTokenAuthMiddleware: Symbol.for('ValetTokenAuthMiddleware'),

  // env vars
  S3_BUCKET_NAME: Symbol.for('S3_BUCKET_NAME'),
  S3_AWS_REGION: Symbol.for('S3_AWS_REGION'),
  SNS_TOPIC_ARN: Symbol.for('SNS_TOPIC_ARN'),
  SNS_AWS_REGION: Symbol.for('SNS_AWS_REGION'),
  VALET_TOKEN_SECRET: Symbol.for('VALET_TOKEN_SECRET'),
  REDIS_URL: Symbol.for('REDIS_URL'),
  REDIS_EVENTS_CHANNEL: Symbol.for('REDIS_EVENTS_CHANNEL'),
  MAX_CHUNK_BYTES: Symbol.for('MAX_CHUNK_BYTES'),
  VERSION: Symbol.for('VERSION'),
}

export default TYPES
