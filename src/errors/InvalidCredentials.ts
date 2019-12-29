/**
 * @class InvalidCredentials
 * @extends Error
 * @author: aboulmane
 * @description: exception raised when we can not authenticate.
 */
export class InvalidCredentials extends Error {
  name = "InvalidCredentials";

  constructor (msg: string) {
    super();
    this.message = msg;
    Object.setPrototypeOf(this, InvalidCredentials.prototype);
  }
}
