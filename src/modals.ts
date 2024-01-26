import { ChangeAppPositionModal } from '~/components/Dashboard/Modals/ChangePosition/ChangeAppPositionModal';
import { ChangeWidgetPositionModal } from '~/components/Dashboard/Modals/ChangePosition/ChangeWidgetPositionModal';
import { EditAppModal } from '~/components/Dashboard/Modals/EditAppModal/EditAppModal';
import { SelectElementModal } from '~/components/Dashboard/Modals/SelectElement/SelectElementModal';
import { WidgetsEditModal } from '~/components/Dashboard/Tiles/Widgets/WidgetsEditModal';
import { WidgetsRemoveModal } from '~/components/Dashboard/Tiles/Widgets/WidgetsRemoveModal';
import { CategoryEditModal } from '~/components/Dashboard/Wrappers/Category/CategoryEditModal';

import { CreateBoardModal } from './components/Manage/Board/create-board.modal';
import { DeleteBoardModal } from './components/Manage/Board/delete-board.modal';
import { DockerSelectBoardModal } from './components/Manage/Tools/Docker/docker-select-board.modal';
import { CopyInviteModal } from './components/Manage/User/Invite/copy-invite.modal';
import { CreateInviteModal } from './components/Manage/User/Invite/create-invite.modal';
import { DeleteInviteModal } from './components/Manage/User/Invite/delete-invite.modal';
import { ChangeUserRoleModal } from './components/Manage/User/change-user-role.modal';
import { DeleteUserModal } from './components/Manage/User/delete-user.modal';

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
  createBoardModal: CreateBoardModal,
  copyInviteModal: CopyInviteModal,
  deleteBoardModal: DeleteBoardModal,
  changeUserRoleModal: ChangeUserRoleModal,
  dockerSelectBoardModal: DockerSelectBoardModal
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}
