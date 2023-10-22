import { getFullBoardWithLayoutSectionsAsync } from '../db/board';
import { mapApp } from './app';
import { mapWidget } from './widget';

type FullBoardWithLayout = Exclude<
  Awaited<ReturnType<typeof getFullBoardWithLayoutSectionsAsync>>,
  undefined
>;

type MapSection = FullBoardWithLayout['layouts'][number]['sections'][number];

export const mapSection = (
  section: Omit<MapSection, 'items'>,
  items: (ReturnType<typeof mapWidget> | ReturnType<typeof mapApp>)[]
) => {
  const { layoutId, ...withoutLayoutId } = section;
  if (withoutLayoutId.kind === 'empty') {
    const { name, position, kind, ...sectionProps } = withoutLayoutId;
    return {
      ...sectionProps,
      kind,
      position: section.position!,
      items,
    };
  }
  if (withoutLayoutId.kind === 'hidden') {
    const { name, position, kind, ...sectionProps } = withoutLayoutId;
    return {
      ...sectionProps,
      kind,
      position: null,
      items,
    };
  }
  if (withoutLayoutId.kind === 'category') {
    const { name, position, kind, ...sectionProps } = withoutLayoutId;
    return {
      ...sectionProps,
      kind,
      name: name!,
      position: section.position!,
      items,
    };
  }

  const { name, position, kind, ...sectionProps } = withoutLayoutId;

  return {
    ...sectionProps,
    kind,
    position: position === 0 ? ('right' as const) : ('left' as const),
    items,
  };
};
