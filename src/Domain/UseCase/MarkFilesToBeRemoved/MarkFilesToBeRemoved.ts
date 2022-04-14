import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { FileRemoverInterface } from '../../Services/FileRemoverInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { MarkFilesToBeRemovedDTO } from './MarkFilesToBeRemovedDTO'
import { MarkFilesToBeRemovedResponse } from './MarkFilesToBeRemovedResponse'

@injectable()
export class MarkFilesToBeRemoved implements UseCaseInterface {
  constructor(
    @inject(TYPES.FileRemover) private fileRemover: FileRemoverInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
  }

  async execute(dto: MarkFilesToBeRemovedDTO): Promise<MarkFilesToBeRemovedResponse> {
    try {
      this.logger.debug(`Marking files for later removal for user: ${dto.userUuid}`)

      await this.fileRemover.markFilesToBeRemoved(dto.userUuid)

      return {
        success: true,
      }
    } catch (error) {
      this.logger.error(`Could not mark resources for removal: ${dto.userUuid} - ${error.message}`)

      return {
        success: false,
        message: 'Could not mark resources for removal',
      }
    }
  }
}
