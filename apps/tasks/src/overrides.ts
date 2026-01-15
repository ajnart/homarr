import { setGlobalDispatcher } from "undici";

import { UndiciHttpAgent } from "@homarr/core/infrastructure/http";

setGlobalDispatcher(new UndiciHttpAgent());
