import { NextResponse } from "next/server";

import githubContributors from "../../../../../../../../static-data/contributors.json";

export const GET = () => {
  return NextResponse.json(githubContributors);
};

export const dynamic = "force-static";
