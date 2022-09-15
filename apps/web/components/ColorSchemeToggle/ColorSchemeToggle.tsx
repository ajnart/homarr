import { Box, useMantineColorScheme } from '@mantine/core';
import { IconSun as Sun, IconMoonStars as MoonStars } from '@tabler/icons';
import { motion } from 'framer-motion';

export function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 90 }}
      whileTap={{
        scale: 0.8,
        rotate: -90,
        borderRadius: '100%',
      }}
    >
      <Box
        onClick={() => toggleColorScheme()}
        sx={(theme) => ({
          cursor: 'pointer',
          color: theme.colorScheme === 'dark' ? theme.colors.yellow[4] : theme.colors.blue[6],
        })}
      >
        {colorScheme === 'dark' ? <Sun size={24} /> : <MoonStars size={24} />}
      </Box>
    </motion.div>
  );
}
