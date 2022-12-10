import { DashDotGraphType } from '../../../../types/integration';

export interface DashDotGraph {
  id: DashDotGraphType;
  name: string;
  twoSpan: boolean;
  isMultiView: boolean | undefined;
}
