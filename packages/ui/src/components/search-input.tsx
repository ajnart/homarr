"use client";

import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";

interface SearchInputProps {
  defaultValue?: string;
  placeholder: string;
  flexExpand?: boolean;
}

export const SearchInput = ({ placeholder, defaultValue, flexExpand = false }: SearchInputProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { replace } = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const handleSearchDebounced = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", value.toString());
    if (params.has("page")) params.set("page", "1"); // Reset page to 1
    replace(`${pathName}?${params.toString()}`);
    setLoading(false);
  }, 250);

  const handleSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLoading(true);
      handleSearchDebounced(event.currentTarget.value);
    },
    [setLoading, handleSearchDebounced],
  );

  return (
    <TextInput
      leftSection={<LeftSection loading={loading} />}
      defaultValue={defaultValue}
      onChange={handleSearch}
      placeholder={placeholder}
      style={{ flex: flexExpand ? "1" : undefined }}
    />
  );
};

interface LeftSectionProps {
  loading: boolean;
}
const LeftSection = ({ loading }: LeftSectionProps) => {
  if (loading) {
    return <Loader size="xs" />;
  }

  return <IconSearch size={20} stroke={1.5} />;
};
