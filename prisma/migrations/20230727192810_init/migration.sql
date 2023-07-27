-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "appBehaviourId" TEXT NOT NULL,
    "appNetworkId" TEXT NOT NULL,
    "appAppearanceId" TEXT NOT NULL,
    "appIntegrationId" TEXT NOT NULL,
    CONSTRAINT "App_appBehaviourId_fkey" FOREIGN KEY ("appBehaviourId") REFERENCES "AppBehaviour" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "App_appNetworkId_fkey" FOREIGN KEY ("appNetworkId") REFERENCES "AppNetwork" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "App_appAppearanceId_fkey" FOREIGN KEY ("appAppearanceId") REFERENCES "AppAppearance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "App_appIntegrationId_fkey" FOREIGN KEY ("appIntegrationId") REFERENCES "AppIntegration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppBehaviour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalUrl" TEXT NOT NULL,
    "isOpeningNewTab" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "AppNetwork" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enabledStatusChecker" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "HttpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "appNetworkId" TEXT,
    CONSTRAINT "HttpCode_appNetworkId_fkey" FOREIGN KEY ("appNetworkId") REFERENCES "AppNetwork" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppAppearance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iconUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AppIntegration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "appIntegrationPropertyId" TEXT NOT NULL,
    CONSTRAINT "AppIntegration_appIntegrationPropertyId_fkey" FOREIGN KEY ("appIntegrationPropertyId") REFERENCES "AppIntegrationProperty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppIntegrationProperty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "integrationFieldId" TEXT NOT NULL,
    "value" TEXT,
    "isDefined" BOOLEAN NOT NULL,
    CONSTRAINT "AppIntegrationProperty_integrationFieldId_fkey" FOREIGN KEY ("integrationFieldId") REFERENCES "IntegrationField" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationField" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateIndex
CREATE UNIQUE INDEX "App_name_key" ON "App"("name");

-- CreateIndex
CREATE UNIQUE INDEX "App_url_key" ON "App"("url");

-- CreateIndex
CREATE UNIQUE INDEX "AppBehaviour_externalUrl_key" ON "AppBehaviour"("externalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "HttpCode_code_key" ON "HttpCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "HttpCode_description_key" ON "HttpCode"("description");

-- CreateIndex
CREATE UNIQUE INDEX "AppIntegration_type_key" ON "AppIntegration"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AppIntegrationProperty_type_key" ON "AppIntegrationProperty"("type");
