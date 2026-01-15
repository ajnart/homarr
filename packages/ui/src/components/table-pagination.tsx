"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PaginationProps } from "@mantine/core";
import { Pagination } from "@mantine/core";

import { Link } from "@homarr/ui";

interface TablePaginationProps {
  total: number;
}

export const TablePagination = ({ total }: TablePaginationProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { replace } = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const current = Number(searchParams.get("page")) || 1;

  const getItemProps = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());

      return {
        component: Link,
        href: `?${params.toString()}`,
      };
    },
    [searchParams],
  );

  const getControlProps = useCallback(
    (control: ControlType) => {
      return getItemProps(calculatePageFor(control, current, total));
    },
    [current, getItemProps, total],
  );

  const handleChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      replace(`${pathName}?${params.toString()}`);
    },
    [pathName, replace, searchParams],
  );

  return (
    <Pagination total={total} getItemProps={getItemProps} getControlProps={getControlProps} onChange={handleChange} />
  );
};

type ControlType = Parameters<Exclude<PaginationProps["getControlProps"], undefined>>[0];
const calculatePageFor = (type: ControlType, current: number, total: number) => {
  switch (type) {
    case "first":
      return 1;
    case "previous":
      return Math.max(current - 1, 1);
    case "next":
      return current + 1;
    case "last":
      return total;
    default:
      console.error(`Unknown pagination control type: ${type as string}`);
      return 1;
  }
};
