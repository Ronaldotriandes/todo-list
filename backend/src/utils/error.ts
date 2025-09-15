export class NotFoundError extends Error {
  constructor(entityName: string, identifier?: string | number) {
    const message = entityName;

    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(entityName: string, identifier?: string | number) {
    const message = entityName;

    super(message);
    this.name = 'UnauthorizedError';
  }
}
