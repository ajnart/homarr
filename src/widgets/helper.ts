// Method which allows to define the type very specifically and type checks all
import { IWidgetDefinition } from './widgets';

// The options of IWidgetDefinition are so heavily typed that it even used 'true' as type
export const defineWidget = <TKey extends string, TOptions extends IWidgetDefinition<TKey>>(
  options: TOptions
) => options;
