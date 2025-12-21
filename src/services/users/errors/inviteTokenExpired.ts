export class InviteTokenExpiredError extends Error {
  constructor() {
    super('Invite token expired')
  }
}
