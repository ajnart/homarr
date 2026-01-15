import { NextResponse } from "next/server";

import crowdinContributors from "../../../../../../../../static-data/translators.json";

export const GET = () => {
  return NextResponse.json(crowdinContributors);
};

export const dynamic = "force-static";
