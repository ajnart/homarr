import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';

type BoardProps = {
  boardName: string;
  boardId: string;
  layoutId?: string;
};

type OuterBoardContextType = Partial<BoardProps> & {
  setProps: Dispatch<SetStateAction<BoardProps | undefined>>;
};

const OuterBoardContext = createContext<OuterBoardContextType | null>(null);

export const OuterBoardProvider = ({ children }: { children: ReactNode }) => {
  const [props, setProps] = useState<BoardProps>();

  return (
    <OuterBoardContext.Provider
      value={{
        ...props,
        setProps,
      }}
    >
      {children}
    </OuterBoardContext.Provider>
  );
};

export const useRequiredBoardProps = () => {
  const optionalBoard = useOptionalBoardProps();
  if (!optionalBoard) throw new Error('useBoard must be used within a BoardProvider');
  return {
    boardName: optionalBoard.boardName!,
    boardId: optionalBoard.boardId!,
    ...optionalBoard,
  };
};

export const useOptionalBoardProps = () => {
  const ctx = useContext(OuterBoardContext);
  return ctx;
};
