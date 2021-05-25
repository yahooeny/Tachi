import { KtLogger } from "../../../../../lib/logger/logger";
import GenericParseEamIIDXCSV from "../../common/eamusement-iidx-csv/parser";
import {
    IIDXEamusementCSVContext,
    IIDXEamusementCSVData,
} from "../../common/eamusement-iidx-csv/types";
import { ParserFunctionReturnsSync } from "../../common/types";

function ParseEamusementIIDXCSV(
    fileData: Express.Multer.File,
    body: Record<string, unknown>,
    logger: KtLogger
): ParserFunctionReturnsSync<IIDXEamusementCSVData, IIDXEamusementCSVContext> {
    return GenericParseEamIIDXCSV(fileData, body, "e-amusement", logger);
}

export default ParseEamusementIIDXCSV;
