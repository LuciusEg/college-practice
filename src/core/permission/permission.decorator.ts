import { SetMetadata } from '@nestjs/common/decorators';

export const PERMISSION_METADATA = 'PERMISSION_METADATA';

export const Permission = (...permissions: string[]) =>
  SetMetadata(PERMISSION_METADATA, permissions);
