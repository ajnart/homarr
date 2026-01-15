CREATE TABLE "account" (
	"user_id" varchar(64) NOT NULL,
	"type" text NOT NULL,
	"provider" varchar(64) NOT NULL,
	"provider_account_id" varchar(64) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "apiKey" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"api_key" text NOT NULL,
	"salt" text NOT NULL,
	"user_id" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_url" text NOT NULL,
	"href" text,
	"ping_url" text
);
--> statement-breakpoint
CREATE TABLE "boardGroupPermission" (
	"board_id" varchar(64) NOT NULL,
	"group_id" varchar(64) NOT NULL,
	"permission" varchar(128) NOT NULL,
	CONSTRAINT "boardGroupPermission_board_id_group_id_permission_pk" PRIMARY KEY("board_id","group_id","permission")
);
--> statement-breakpoint
CREATE TABLE "boardUserPermission" (
	"board_id" varchar(64) NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"permission" varchar(128) NOT NULL,
	CONSTRAINT "boardUserPermission_board_id_user_id_permission_pk" PRIMARY KEY("board_id","user_id","permission")
);
--> statement-breakpoint
CREATE TABLE "board" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"creator_id" varchar(64),
	"page_title" text,
	"meta_title" text,
	"logo_image_url" text,
	"favicon_image_url" text,
	"background_image_url" text,
	"background_image_attachment" text DEFAULT 'fixed' NOT NULL,
	"background_image_repeat" text DEFAULT 'no-repeat' NOT NULL,
	"background_image_size" text DEFAULT 'cover' NOT NULL,
	"primary_color" text DEFAULT '#fa5252' NOT NULL,
	"secondary_color" text DEFAULT '#fd7e14' NOT NULL,
	"opacity" integer DEFAULT 100 NOT NULL,
	"custom_css" text,
	"icon_color" text,
	"item_radius" text DEFAULT 'lg' NOT NULL,
	"disable_status" boolean DEFAULT false NOT NULL,
	CONSTRAINT "board_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "cron_job_configuration" (
	"name" varchar(256) PRIMARY KEY NOT NULL,
	"cron_expression" varchar(32) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groupMember" (
	"group_id" varchar(64) NOT NULL,
	"user_id" varchar(64) NOT NULL,
	CONSTRAINT "groupMember_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "groupPermission" (
	"group_id" varchar(64) NOT NULL,
	"permission" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"owner_id" varchar(64),
	"home_board_id" varchar(64),
	"mobile_home_board_id" varchar(64),
	"position" smallint NOT NULL,
	CONSTRAINT "group_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "iconRepository" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"slug" varchar(150) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "icon" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(250) NOT NULL,
	"url" text NOT NULL,
	"checksum" text NOT NULL,
	"icon_repository_id" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrationGroupPermissions" (
	"integration_id" varchar(64) NOT NULL,
	"group_id" varchar(64) NOT NULL,
	"permission" varchar(128) NOT NULL,
	CONSTRAINT "integration_group_permission__pk" PRIMARY KEY("integration_id","group_id","permission")
);
--> statement-breakpoint
CREATE TABLE "integration_item" (
	"item_id" varchar(64) NOT NULL,
	"integration_id" varchar(64) NOT NULL,
	CONSTRAINT "integration_item_item_id_integration_id_pk" PRIMARY KEY("item_id","integration_id")
);
--> statement-breakpoint
CREATE TABLE "integrationSecret" (
	"kind" varchar(16) NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"integration_id" varchar(64) NOT NULL,
	CONSTRAINT "integrationSecret_integration_id_kind_pk" PRIMARY KEY("integration_id","kind")
);
--> statement-breakpoint
CREATE TABLE "integrationUserPermission" (
	"integration_id" varchar(64) NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"permission" varchar(128) NOT NULL,
	CONSTRAINT "integrationUserPermission_integration_id_user_id_permission_pk" PRIMARY KEY("integration_id","user_id","permission")
);
--> statement-breakpoint
CREATE TABLE "integration" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"kind" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"token" varchar(512) NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"creator_id" varchar(64) NOT NULL,
	CONSTRAINT "invite_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "item_layout" (
	"item_id" varchar(64) NOT NULL,
	"section_id" varchar(64) NOT NULL,
	"layout_id" varchar(64) NOT NULL,
	"x_offset" integer NOT NULL,
	"y_offset" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	CONSTRAINT "item_layout_item_id_section_id_layout_id_pk" PRIMARY KEY("item_id","section_id","layout_id")
);
--> statement-breakpoint
CREATE TABLE "item" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"board_id" varchar(64) NOT NULL,
	"kind" text NOT NULL,
	"options" text DEFAULT '{"json": {}}' NOT NULL,
	"advanced_options" text DEFAULT '{"json": {}}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "layout" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(32) NOT NULL,
	"board_id" varchar(64) NOT NULL,
	"column_count" smallint NOT NULL,
	"breakpoint" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(512) NOT NULL,
	"content" "bytea" NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"creator_id" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "onboarding" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"step" varchar(64) NOT NULL,
	"previous_step" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "search_engine" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"icon_url" text NOT NULL,
	"name" varchar(64) NOT NULL,
	"short" varchar(8) NOT NULL,
	"description" text,
	"url_template" text,
	"type" varchar(64) DEFAULT 'generic' NOT NULL,
	"integration_id" varchar(64),
	CONSTRAINT "search_engine_short_unique" UNIQUE("short")
);
--> statement-breakpoint
CREATE TABLE "section_collapse_state" (
	"user_id" varchar(64) NOT NULL,
	"section_id" varchar(64) NOT NULL,
	"collapsed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "section_collapse_state_user_id_section_id_pk" PRIMARY KEY("user_id","section_id")
);
--> statement-breakpoint
CREATE TABLE "section_layout" (
	"section_id" varchar(64) NOT NULL,
	"layout_id" varchar(64) NOT NULL,
	"parent_section_id" varchar(64),
	"x_offset" integer NOT NULL,
	"y_offset" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	CONSTRAINT "section_layout_section_id_layout_id_pk" PRIMARY KEY("section_id","layout_id")
);
--> statement-breakpoint
CREATE TABLE "section" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"board_id" varchar(64) NOT NULL,
	"kind" text NOT NULL,
	"x_offset" integer,
	"y_offset" integer,
	"name" text,
	"options" text DEFAULT '{"json": {}}'
);
--> statement-breakpoint
CREATE TABLE "serverSetting" (
	"setting_key" varchar(64) PRIMARY KEY NOT NULL,
	"value" text DEFAULT '{"json": {}}' NOT NULL,
	CONSTRAINT "serverSetting_settingKey_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" varchar(512) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trusted_certificate_hostname" (
	"hostname" varchar(256) NOT NULL,
	"thumbprint" varchar(128) NOT NULL,
	"certificate" text NOT NULL,
	CONSTRAINT "trusted_certificate_hostname_hostname_thumbprint_pk" PRIMARY KEY("hostname","thumbprint")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	"password" text,
	"salt" text,
	"provider" varchar(64) DEFAULT 'credentials' NOT NULL,
	"home_board_id" varchar(64),
	"mobile_home_board_id" varchar(64),
	"default_search_engine_id" varchar(64),
	"open_search_in_new_tab" boolean DEFAULT false NOT NULL,
	"color_scheme" varchar(5) DEFAULT 'dark' NOT NULL,
	"first_day_of_week" smallint DEFAULT 1 NOT NULL,
	"ping_icons_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" varchar(64) NOT NULL,
	"token" varchar(512) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apiKey" ADD CONSTRAINT "apiKey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardGroupPermission" ADD CONSTRAINT "boardGroupPermission_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardGroupPermission" ADD CONSTRAINT "boardGroupPermission_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardUserPermission" ADD CONSTRAINT "boardUserPermission_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boardUserPermission" ADD CONSTRAINT "boardUserPermission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board" ADD CONSTRAINT "board_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groupMember" ADD CONSTRAINT "groupMember_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groupMember" ADD CONSTRAINT "groupMember_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groupPermission" ADD CONSTRAINT "groupPermission_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_home_board_id_board_id_fk" FOREIGN KEY ("home_board_id") REFERENCES "public"."board"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group" ADD CONSTRAINT "group_mobile_home_board_id_board_id_fk" FOREIGN KEY ("mobile_home_board_id") REFERENCES "public"."board"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "icon" ADD CONSTRAINT "icon_icon_repository_id_iconRepository_id_fk" FOREIGN KEY ("icon_repository_id") REFERENCES "public"."iconRepository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationGroupPermissions" ADD CONSTRAINT "integrationGroupPermissions_integration_id_integration_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationGroupPermissions" ADD CONSTRAINT "integrationGroupPermissions_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_item" ADD CONSTRAINT "integration_item_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_item" ADD CONSTRAINT "integration_item_integration_id_integration_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationSecret" ADD CONSTRAINT "integrationSecret_integration_id_integration_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationUserPermission" ADD CONSTRAINT "integrationUserPermission_integration_id_integration_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrationUserPermission" ADD CONSTRAINT "integrationUserPermission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_layout" ADD CONSTRAINT "item_layout_item_id_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_layout" ADD CONSTRAINT "item_layout_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_layout" ADD CONSTRAINT "item_layout_layout_id_layout_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."layout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item" ADD CONSTRAINT "item_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "layout" ADD CONSTRAINT "layout_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_engine" ADD CONSTRAINT "search_engine_integration_id_integration_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_collapse_state" ADD CONSTRAINT "section_collapse_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_collapse_state" ADD CONSTRAINT "section_collapse_state_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_layout" ADD CONSTRAINT "section_layout_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_layout" ADD CONSTRAINT "section_layout_layout_id_layout_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."layout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section_layout" ADD CONSTRAINT "section_layout_parent_section_id_section_id_fk" FOREIGN KEY ("parent_section_id") REFERENCES "public"."section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_home_board_id_board_id_fk" FOREIGN KEY ("home_board_id") REFERENCES "public"."board"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_mobile_home_board_id_board_id_fk" FOREIGN KEY ("mobile_home_board_id") REFERENCES "public"."board"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_default_search_engine_id_search_engine_id_fk" FOREIGN KEY ("default_search_engine_id") REFERENCES "public"."search_engine"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "integration_secret__kind_idx" ON "integrationSecret" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "integration_secret__updated_at_idx" ON "integrationSecret" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "integration__kind_idx" ON "integration" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "session" USING btree ("user_id");