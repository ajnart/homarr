import { Box, Grid, GridCol, Group, Image, Stack, Title } from "@mantine/core";

import { splitToNChunks } from "@homarr/common";
import { integrationDefs } from "@homarr/definitions";
import { getScopedI18n } from "@homarr/translation/server";

import classes from "./hero-banner.module.css";

const icons = Object.values(integrationDefs)
  .filter((int) => int.name !== "Mock")
  .map((int) => int.iconUrl);

const countIconGroups = 3;
const animationDurationInSeconds = icons.length;
const arrayInChunks = splitToNChunks(icons, countIconGroups);
const gridSpan = 12 / countIconGroups;

export const HeroBanner = async () => {
  const t = await getScopedI18n("management.page.home");

  return (
    <Box className={classes.bannerContainer} p={{ base: "lg", md: "3rem" }} bg="dark.6" pos="relative">
      <Stack gap={0}>
        <Title fz={{ base: "h4", md: "h2" }} c="dimmed">
          {t("heroBanner.title")}
        </Title>
        <Group gap="xs" wrap="nowrap">
          <Image src="/logo/logo.png" w={{ base: 32, md: 40 }} h={{ base: 32, md: 40 }} />
          <Title fz={{ base: "h3", md: "h1" }}>{t("heroBanner.subtitle", { app: "Homarr" })}</Title>
        </Group>
      </Stack>
      <Box visibleFrom="md" className={classes.scrollContainer} w={"30%"} top={0} right={0} pos="absolute">
        <Grid>
          {Array(countIconGroups)
            .fill(0)
            .map((_, columnIndex) => (
              <GridCol key={`grid-column-${columnIndex}`} span={gridSpan}>
                <Stack
                  className={classes.scrollAnimationContainer}
                  style={{
                    animationDuration: `${animationDurationInSeconds - columnIndex}s`,
                  }}
                >
                  {arrayInChunks[columnIndex]?.map((icon, index) => (
                    <Image
                      key={`grid-column-${columnIndex}-scroll-1-${index}`}
                      src={icon}
                      radius="md"
                      fit={"contain"}
                      w={50}
                      h={50}
                    />
                  ))}

                  {/* This is used for making the animation seem seamless */}
                  {arrayInChunks[columnIndex]?.map((icon, index) => (
                    <Image
                      key={`grid-column-${columnIndex}-scroll-2-${index}`}
                      src={icon}
                      radius="md"
                      fit={"contain"}
                      w={50}
                      h={50}
                    />
                  ))}
                </Stack>
              </GridCol>
            ))}
        </Grid>
      </Box>
    </Box>
  );
};
