export const runtimeEnvWithPrefix = (prefix: `${string}_`) =>
  Object.entries(process.env)
    .filter(([key]) => key.startsWith(prefix))
    .reduce(
      (acc, [key, value]) => {
        if (value === undefined) return acc;

        const newKey = key.replace(prefix, "");
        acc[newKey] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
