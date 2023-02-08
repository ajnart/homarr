import { Accordion, Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useConfigContext } from '../../../../config/provider';
import { CategoryType } from '../../../../types/category';
import { useCardStyles } from '../../../layout/useCardStyles';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { useGridstack } from '../gridstack/use-gridstack';
import { WrapperContent } from '../WrapperContent';
import { CategoryEditMenu } from './CategoryEditMenu';

interface DashboardCategoryProps {
  category: CategoryType;
}

export const DashboardCategory = ({ category }: DashboardCategoryProps) => {
  const { refs, apps, widgets } = useGridstack('category', category.id);
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { config } = useConfigContext();
  const { classes: cardClasses, cx } = useCardStyles(true);

  const categoryList = config?.categories.map((x) => x.name) ?? [];
  const [toggledCategories, setToggledCategories] = useLocalStorage({
    key: `${config?.configProperties.name}-app-shelf-toggled`,
    // This is a bit of a hack to toggle the categories on the first load, return a string[] of the categories
    defaultValue: categoryList,
  });

  return (
    <Accordion
      classNames={{
        item: cx(cardClasses.card, 'dashboard-gs-category-item'),
      }}
      mx={10}
      chevronPosition="left"
      multiple
      value={isEditMode ? categoryList : toggledCategories}
      variant="separated"
      radius="lg"
      onChange={(state) => {
        // Cancel if edit mode is on
        if (isEditMode) return;
        setToggledCategories([...state]);
      }}
    >
      <Accordion.Item value={category.name}>
        <Accordion.Control icon={isEditMode && <CategoryEditMenu category={category} />}>
          <Title order={3}>{category.name}</Title>
        </Accordion.Control>
        <Accordion.Panel>
          <div
            className="grid-stack grid-stack-category"
            data-category={category.id}
            ref={refs.wrapper}
          >
            <WrapperContent apps={apps} refs={refs} widgets={widgets} />
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
