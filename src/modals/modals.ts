import { ChangeAppPositionModal } from '~/components/Dashboard/Modals/ChangePosition/ChangeAppPositionModal';
import { ChangeWidgetPositionModal } from '~/components/Dashboard/Modals/ChangePosition/ChangeWidgetPositionModal';
import { EditAppModal } from '~/components/Dashboard/Modals/EditAppModal/EditAppModal';
import { SelectElementModal } from '~/components/Dashboard/Modals/SelectElement/SelectElementModal';
import { WidgetsEditModal } from '~/components/Dashboard/Tiles/Widgets/WidgetsEditModal';
import { WidgetsRemoveModal } from '~/components/Dashboard/Tiles/Widgets/WidgetsRemoveModal';
import { CategoryEditModal } from '~/components/Dashboard/Wrappers/Category/CategoryEditModal';

import { DeleteUserModal } from './delete-user/delete-user.modal';
import { CreateRegistrationTokenModal } from './create-registration-token/create-registration-token.modal';
import { DeleteRegistrationTokenModal } from './delete-registration-token/delete-registration-token.modal';
import { CreateDashboardModal } from './create-dashboard/create-dashboard.modal';

export const modals = {
  editApp: EditAppModal,
  selectElement: SelectElementModal,
  integrationOptions: WidgetsEditModal,
  integrationRemove: WidgetsRemoveModal,
  categoryEditModal: CategoryEditModal,
  changeAppPositionModal: ChangeAppPositionModal,
  changeIntegrationPositionModal: ChangeWidgetPositionModal,
  deleteUserModal: DeleteUserModal,
  createRegistrationTokenModal: CreateRegistrationTokenModal,
  deleteRegistrationTokenModal: DeleteRegistrationTokenModal,
  createDashboardModal: CreateDashboardModal
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}
