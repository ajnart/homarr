import { HomarrCardWrapper } from './HomarrCardWrapper';
import { BaseTileProps } from './type';

export const EmptyTile = ({ className }: BaseTileProps) => {
  return <HomarrCardWrapper className={className}>Empty</HomarrCardWrapper>;
};
