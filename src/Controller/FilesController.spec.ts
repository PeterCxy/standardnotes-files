import 'reflect-metadata'

import { CreateUploadSession } from '../Domain/UseCase/CreateUploadSession/CreateUploadSession'
import { FinishUploadSession } from '../Domain/UseCase/FinishUploadSession/FinishUploadSession'
import { StreamDownloadFile } from '../Domain/UseCase/StreamDownloadFile/StreamDownloadFile'
import { UploadFileChunk } from '../Domain/UseCase/UploadFileChunk/UploadFileChunk'

import { Request, Response } from 'express'
import { Writable, Readable } from 'stream'
import { FilesController } from './FilesController'
import { GetFileMetadata } from '../Domain/UseCase/GetFileMetadata/GetFileMetadata'
import { results } from 'inversify-express-utils'

describe('FilesController', () => {
  let uploadFileChunk: UploadFileChunk
  let createUploadSession: CreateUploadSession
  let finishUploadSession: FinishUploadSession
  let streamDownloadFile: StreamDownloadFile
  let getFileMetadata: GetFileMetadata
  let request: Request
  let response: Response
  let readStream: Readable
  const maxChunkBytes = 100_000

  const createController = () => new FilesController(
    uploadFileChunk,
    createUploadSession,
    finishUploadSession,
    streamDownloadFile,
    getFileMetadata,
    maxChunkBytes,
  )

  beforeEach(() => {
    readStream = {} as jest.Mocked<Readable>
    readStream.pipe = jest.fn().mockReturnValue(new Writable())

    streamDownloadFile = {} as jest.Mocked<StreamDownloadFile>
    streamDownloadFile.execute = jest.fn().mockReturnValue({ success: true, readStream })

    uploadFileChunk = {} as jest.Mocked<UploadFileChunk>
    uploadFileChunk.execute = jest.fn().mockReturnValue({ success: true })

    createUploadSession = {} as jest.Mocked<CreateUploadSession>
    createUploadSession.execute = jest.fn().mockReturnValue({ success: true, uploadId: '123' })

    finishUploadSession = {} as jest.Mocked<FinishUploadSession>
    finishUploadSession.execute = jest.fn().mockReturnValue({ success: true })

    getFileMetadata = {} as jest.Mocked<GetFileMetadata>
    getFileMetadata.execute = jest.fn().mockReturnValue({ success: true, size: 555_555 })

    request = {
      body: {},
      headers: {},
    } as jest.Mocked<Request>
    response = {
      locals: {},
    } as jest.Mocked<Response>
    response.locals.userUuid = '1-2-3'
    response.locals.permittedResources = ['2-3-4']
    response.writeHead = jest.fn()
  })

  it('should return a writable stream upon file download', async () => {
    request.headers['range'] = 'bytes=0-'

    const result = await createController().download(request, response) as () => Writable

    expect(response.writeHead).toHaveBeenCalledWith(206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 100000,
      'Content-Range': 'bytes 0-99999/555555',
      'Content-Type': 'application/octet-stream',
    })

    expect(result()).toBeInstanceOf(Writable)
  })

  it('should return proper byte range on consecutive calls', async () => {
    request.headers['range'] = 'bytes=0-'

    await createController().download(request, response) as () => Writable

    request.headers['range'] = 'bytes=100000-'

    await createController().download(request, response) as () => Writable

    expect(response.writeHead).toHaveBeenNthCalledWith(1, 206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 100000,
      'Content-Range': 'bytes 0-99999/555555',
      'Content-Type': 'application/octet-stream',
    })

    expect(response.writeHead).toHaveBeenNthCalledWith(2, 206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 100000,
      'Content-Range': 'bytes 100000-199999/555555',
      'Content-Type': 'application/octet-stream',
    })
  })

  it('should return a writable stream with custom chunk size', async () => {
    request.headers['x-chunk-size'] = '50000'
    request.headers['range'] = 'bytes=0-'

    const result = await createController().download(request, response) as () => Writable

    expect(response.writeHead).toHaveBeenCalledWith(206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 50000,
      'Content-Range': 'bytes 0-49999/555555',
      'Content-Type': 'application/octet-stream',
    })

    expect(result()).toBeInstanceOf(Writable)
  })

  it('should default to maximum chunk size if custom chunk size is too large', async () => {
    request.headers['x-chunk-size'] = '200000'
    request.headers['range'] = 'bytes=0-'

    const result = await createController().download(request, response) as () => Writable

    expect(response.writeHead).toHaveBeenCalledWith(206, {
      'Accept-Ranges': 'bytes',
      'Content-Length': 100000,
      'Content-Range': 'bytes 0-99999/555555',
      'Content-Type': 'application/octet-stream',
    })

    expect(result()).toBeInstanceOf(Writable)
  })

  it('should not return a writable stream if bytes range is not provided', async () => {
    const httpResponse = await createController().download(request, response)

    expect(httpResponse).toBeInstanceOf(results.BadRequestErrorMessageResult)
  })

  it('should not return a writable stream if getting file metadata fails', async () => {
    request.headers['range'] = 'bytes=0-'

    getFileMetadata.execute = jest.fn().mockReturnValue({ success: false, message: 'error' })

    const httpResponse = await createController().download(request, response)

    expect(httpResponse).toBeInstanceOf(results.BadRequestErrorMessageResult)
  })

  it('should not return a writable stream if creating download stream fails', async () => {
    request.headers['range'] = 'bytes=0-'

    streamDownloadFile.execute = jest.fn().mockReturnValue({ success: false, message: 'error' })

    const httpResponse = await createController().download(request, response)

    expect(httpResponse).toBeInstanceOf(results.BadRequestErrorMessageResult)
  })

  it('should create an upload session', async () => {
    await createController().startUpload(request, response)

    expect(createUploadSession.execute).toHaveBeenCalledWith({
      resource: '2-3-4',
      userUuid: '1-2-3',
    })
  })

  it('should return bad request if upload session could not be created', async () => {
    createUploadSession.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = await createController().startUpload(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should finish an upload session', async () => {
    await createController().finishUpload(request, response)

    expect(finishUploadSession.execute).toHaveBeenCalledWith({
      resource: '2-3-4',
      userUuid: '1-2-3',
    })
  })

  it('should return bad request if upload session could not be finished', async () => {
    finishUploadSession.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = await createController().finishUpload(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should upload a chunk to an upload session', async () => {
    request.headers['x-chunk-id'] = '2'
    request.body = Buffer.from([123])

    await createController().uploadChunk(request, response)

    expect(uploadFileChunk.execute).toHaveBeenCalledWith({
      chunkId: 2,
      data: Buffer.from([123]),
      resource: '2-3-4',
      userUuid: '1-2-3',
    })
  })

  it('should return bad request if chunk could not be uploaded', async () => {
    request.headers['x-chunk-id'] = '2'
    request.body = Buffer.from([123])
    uploadFileChunk.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = await createController().uploadChunk(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })

  it('should return bad request if chunk id is missing', async () => {
    request.body = Buffer.from([123])

    const httpResponse = await createController().uploadChunk(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(400)
  })
})
