import { ChangeAppPositionModal } from '~/components/Board/Items/App/ChangeAppPositionModal';
import { EditAppModal } from '~/components/Board/Items/App/EditAppModal';
import { ChangeWidgetPositionModal } from '~/components/Board/Items/Widget/ChangeWidgetPositionModal';
import { WidgetsEditModal } from '~/components/Board/Items/Widget/WidgetsEditModal';
import { CategoryEditModal } from '~/components/Board/Sections/Category/CategoryEditModal';
import { SelectElementModal } from '~/components/Board/SelectElement/SelectElementModal';

import { CreateBoardModal } from './components/Board/BoardCreateModal';
import { CreateLayoutModal } from './components/Board/Layout/LayoutCreateModal';
//import { CreateBoardModal } from './components/Manage/Board/create-board.modal';
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
  categoryEditModal: CategoryEditModal,
  changeAppPositionModal: ChangeAppPositionModal,
  changeWidgetPositionModal: ChangeWidgetPositionModal,
  deleteUserModal: DeleteUserModal,
  createInviteModal: CreateInviteModal,
  deleteInviteModal: DeleteInviteModal,
  //createBoardModal: CreateBoardModal,
  createBoardModal: CreateBoardModal,
  createLayoutModal: CreateLayoutModal,
  copyInviteModal: CopyInviteModal,
  deleteBoardModal: DeleteBoardModal,
  changeUserRoleModal: ChangeUserRoleModal,
  dockerSelectBoardModal: DockerSelectBoardModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}
