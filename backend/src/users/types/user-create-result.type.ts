export interface UserCreateDuplicateEmailResult {
  type: 'duplicate_email';
}

export interface UserCreateSuccessResult {
  type: 'created';
  user: import('./user-record.type').UserRecord;
}

export type UserCreateResult = UserCreateDuplicateEmailResult | UserCreateSuccessResult;
