import { AccountDeletionRequestedEvent, DomainEventHandlerInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'

import TYPES from '../../Bootstrap/Types'
import { DomainEventFactoryInterface } from '../Event/DomainEventFactoryInterface'
import { MarkFilesToBeRemoved } from '../UseCase/MarkFilesToBeRemoved/MarkFilesToBeRemoved'

@injectable()
export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor (
    @inject(TYPES.MarkFilesToBeRemoved) private markFilesToBeRemoved: MarkFilesToBeRemoved,
    @inject(TYPES.DomainEventPublisher) private domainEventPublisher: DomainEventPublisherInterface,
    @inject(TYPES.DomainEventFactory) private domainEventFactory: DomainEventFactoryInterface,
  ) {
  }

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const response = await this.markFilesToBeRemoved.execute({
      userUuid: event.payload.userUuid,
    })

    if (!response.success) {
      return
    }

    for (const fileRemoved of response.filesRemoved) {
      await this.domainEventPublisher.publish(
        this.domainEventFactory.createFileRemovedEvent(fileRemoved)
      )
    }
  }
}
