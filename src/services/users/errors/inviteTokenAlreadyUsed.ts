export class InviteTokenAlreadyUsedError extends Error {
  constructor() {
    super('Invite token already used')
  }
}
