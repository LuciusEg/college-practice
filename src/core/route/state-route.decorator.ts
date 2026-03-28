import { SetMetadata } from '@nestjs/common';

export const STATE_ROUTE_METADATA = 'STATE_ROUTE_METADATA';

/**
 * Декоратор для обработки определённого шага(состояния).
 * Навешивается на метод-обработчик этого шага.
 * @param stateKey ключ шага (например, RegisterState.FirstName)
 */
export const StateRoute = (stateKey: string) =>
  SetMetadata(STATE_ROUTE_METADATA, stateKey);
