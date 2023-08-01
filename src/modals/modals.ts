import { ChangeAppPositionModal } from '~/components/Dashboard/Modals/ChangePosition/ChangeAppPositionModal';
import { ChangeWidgetPositionModal } from '~/components/Dashboard/Modals/ChangePosition/ChangeWidgetPositionModal';
import { EditAppModal } from '~/components/Dashboard/Modals/EditAppModal/EditAppModal';
import { SelectElementModal } from '~/components/Dashboard/Modals/SelectElement/SelectElementModal';
import { WidgetsEditModal } from '~/components/Dashboard/Tiles/Widgets/WidgetsEditModal';
import { WidgetsRemoveModal } from '~/components/Dashboard/Tiles/Widgets/WidgetsRemoveModal';
import { CategoryEditModal } from '~/components/Dashboard/Wrappers/Category/CategoryEditModal';

import { CopyInviteModal } from './copy-invite/copy-invite.modal';
import { CreateDashboardModal } from './create-dashboard/create-dashboard.modal';
import { CreateInviteModal } from './create-invite/create-invite.modal';
import { DeleteBoardModal } from './delete-board/delete-board.modal';
import { DeleteInviteModal } from './delete-invite/delete-invite.modal';
import { DeleteUserModal } from './delete-user/delete-user.modal';

export const modals = {
  editApp: EditAppModal,
  selectElement: SelectElementModal,
  integrationOptions: WidgetsEditModal,
  integrationRemove: WidgetsRemoveModal,
  categoryEditModal: CategoryEditModal,
  changeAppPositionModal: ChangeAppPositionModal,
  changeIntegrationPositionModal: ChangeWidgetPositionModal,
  deleteUserModal: DeleteUserModal,
  createInviteModal: CreateInviteModal,
  deleteInviteModal: DeleteInviteModal,
  createDashboardModal: CreateDashboardModal,
  copyInviteModal: CopyInviteModal,
  deleteBoardModal: DeleteBoardModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}
