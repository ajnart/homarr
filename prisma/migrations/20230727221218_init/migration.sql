-- CreateTable
CREATE TABLE "app" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "appBehaviourId" TEXT NOT NULL,
    "appNetworkId" TEXT NOT NULL,
    "appAppearanceId" TEXT NOT NULL,
    "appIntegrationId" TEXT NOT NULL,
    "areaTypeId" TEXT NOT NULL,
    "sizedShapeId" TEXT NOT NULL,
    CONSTRAINT "app_appBehaviourId_fkey" FOREIGN KEY ("appBehaviourId") REFERENCES "appBehaviour" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "app_appNetworkId_fkey" FOREIGN KEY ("appNetworkId") REFERENCES "appNetwork" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "app_appAppearanceId_fkey" FOREIGN KEY ("appAppearanceId") REFERENCES "appAppearance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "app_appIntegrationId_fkey" FOREIGN KEY ("appIntegrationId") REFERENCES "appIntegration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "app_areaTypeId_fkey" FOREIGN KEY ("areaTypeId") REFERENCES "areaType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "app_sizedShapeId_fkey" FOREIGN KEY ("sizedShapeId") REFERENCES "sizedShape" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appBehaviour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "onClickUrl" TEXT NOT NULL,
    "externalUrl" TEXT NOT NULL,
    "isOpeningNewTab" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "appNetwork" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enabledStatusChecker" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "httpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "appNetworkId" TEXT,
    CONSTRAINT "httpCode_appNetworkId_fkey" FOREIGN KEY ("appNetworkId") REFERENCES "appNetwork" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appAppearance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iconUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "appIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "appIntegrationPropertyId" TEXT NOT NULL,
    CONSTRAINT "appIntegration_appIntegrationPropertyId_fkey" FOREIGN KEY ("appIntegrationPropertyId") REFERENCES "appIntegrationProperty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appIntegrationProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "integrationFieldId" TEXT NOT NULL,
    "value" TEXT,
    "isDefined" BOOLEAN NOT NULL,
    CONSTRAINT "appIntegrationProperty_integrationFieldId_fkey" FOREIGN KEY ("integrationFieldId") REFERENCES "integrationField" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "integrationField" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "sizedShape" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "smallShapeId" TEXT NOT NULL,
    "mediumShapeId" TEXT NOT NULL,
    "largeShapeId" TEXT NOT NULL,
    CONSTRAINT "sizedShape_smallShapeId_fkey" FOREIGN KEY ("smallShapeId") REFERENCES "smallShape" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sizedShape_mediumShapeId_fkey" FOREIGN KEY ("mediumShapeId") REFERENCES "mediumShape" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sizedShape_largeShapeId_fkey" FOREIGN KEY ("largeShapeId") REFERENCES "largeShape" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "smallShape" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shapeLocationId" TEXT NOT NULL,
    "shapeSizeId" TEXT NOT NULL,
    CONSTRAINT "smallShape_shapeLocationId_fkey" FOREIGN KEY ("shapeLocationId") REFERENCES "shapeLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "smallShape_shapeSizeId_fkey" FOREIGN KEY ("shapeSizeId") REFERENCES "shapeSize" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mediumShape" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shapeLocationId" TEXT NOT NULL,
    "shapeSizeId" TEXT NOT NULL,
    CONSTRAINT "mediumShape_shapeLocationId_fkey" FOREIGN KEY ("shapeLocationId") REFERENCES "shapeLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mediumShape_shapeSizeId_fkey" FOREIGN KEY ("shapeSizeId") REFERENCES "shapeSize" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "largeShape" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shapeLocationId" TEXT NOT NULL,
    "shapeSizeId" TEXT NOT NULL,
    CONSTRAINT "largeShape_shapeLocationId_fkey" FOREIGN KEY ("shapeLocationId") REFERENCES "shapeLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "largeShape_shapeSizeId_fkey" FOREIGN KEY ("shapeSizeId") REFERENCES "shapeSize" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shapeLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "shapeSize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "areaType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "areaPropertiesId" TEXT NOT NULL,
    CONSTRAINT "areaType_areaPropertiesId_fkey" FOREIGN KEY ("areaPropertiesId") REFERENCES "areaProperties" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "areaProperties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "location" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "app_name_key" ON "app"("name");

-- CreateIndex
CREATE UNIQUE INDEX "app_url_key" ON "app"("url");

-- CreateIndex
CREATE UNIQUE INDEX "appBehaviour_onClickUrl_key" ON "appBehaviour"("onClickUrl");

-- CreateIndex
CREATE UNIQUE INDEX "appBehaviour_externalUrl_key" ON "appBehaviour"("externalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "httpCode_code_key" ON "httpCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "httpCode_description_key" ON "httpCode"("description");

-- CreateIndex
CREATE UNIQUE INDEX "appIntegration_type_key" ON "appIntegration"("type");

-- CreateIndex
CREATE UNIQUE INDEX "appIntegrationProperty_type_key" ON "appIntegrationProperty"("type");
