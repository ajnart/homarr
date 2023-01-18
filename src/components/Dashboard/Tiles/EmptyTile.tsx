import { HomarrCardWrapper } from './HomarrCardWrapper';
import { BaseTileProps } from './type';

export const EmptyTile = ({ className }: BaseTileProps) => (
  <HomarrCardWrapper className={className}>Empty</HomarrCardWrapper>
);
