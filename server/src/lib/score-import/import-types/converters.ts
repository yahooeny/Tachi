import { ConverterAPICGMuseca } from "./common/api-cg/museca/converter";
import { ConverterAPICGPopn } from "./common/api-cg/popn/converter";
import { ConverterAPICGSDVX } from "./common/api-cg/sdvx/converter";
import { ConvertAPIKaiIIDX } from "./common/api-kai/iidx/converter";
import { ConvertAPIKaiSDVX } from "./common/api-kai/sdvx/converter";
import { ConverterBatchManual } from "./common/batch-manual/converter";
import ConvertEamIIDXCSV from "./common/eamusement-iidx-csv/converter";
import ConvertEamSDVXCSV from "./file/eamusement-sdvx-csv/converter";
import { ConvertFileMerIIDX } from "./file/mer-iidx/converter";
import { ConvertFileS3 } from "./file/solid-state-squad/converter";
import ConvertMyPageScraperRecordsCSV from "./file/wacca-mypage-scraper/converter";
import { ConverterIRBarbatos } from "./ir/barbatos/converter";
import { ConverterIRBeatoraja } from "./ir/beatoraja/converter";
import { ConverterIRFervidexStatic } from "./ir/fervidex-static/converter";
import { ConverterIRFervidex } from "./ir/fervidex/converter";
import { ConverterKsHookSV6CStatic } from "./ir/kshook-sv6c-static/converter";
import { ConverterIRKsHookSV6C } from "./ir/kshook-sv6c/converter";
import { ConverterLR2Hook } from "./ir/lr2hook/converter";
import { ConverterIRUSC } from "./ir/usc/converter";
import { Never } from "utils/misc";
import type { ConverterFunction, ImportTypeContextMap, ImportTypeDataMap } from "./common/types";
import type { ImportTypes } from "tachi-common";

export type ConverterMap = {
	[I in ImportTypes]: ConverterFunction<ImportTypeDataMap[I], ImportTypeContextMap[I]>;
};

export const Converters: ConverterMap = {
	"file/solid-state-squad": ConvertFileS3,
	"file/batch-manual": ConverterBatchManual,
	"file/mer-iidx": ConvertFileMerIIDX,
	"file/pli-iidx-csv": ConvertEamIIDXCSV,
	"file/eamusement-iidx-csv": ConvertEamIIDXCSV,
	"file/eamusement-sdvx-csv": ConvertEamSDVXCSV,
	"file/mypagescraper-records-csv": ConvertMyPageScraperRecordsCSV,

	// interestingly, this import method **only** has a class handler, since it's just
	// a CSV that indicates what class you are. Interesting edge case, but we're guaranteed
	// to have an empty array here, so this will never get called.
	"file/mypagescraper-player-csv": Never,

	"api/eag-iidx": ConvertAPIKaiIIDX,
	"api/eag-sdvx": ConvertAPIKaiSDVX,
	"api/flo-iidx": ConvertAPIKaiIIDX,
	"api/flo-sdvx": ConvertAPIKaiSDVX,
	"api/min-sdvx": ConvertAPIKaiSDVX,

	"ir/barbatos": ConverterIRBarbatos,
	"ir/beatoraja": ConverterIRBeatoraja,
	"ir/fervidex": ConverterIRFervidex,
	"ir/fervidex-static": ConverterIRFervidexStatic,
	"ir/direct-manual": ConverterBatchManual,
	"ir/usc": ConverterIRUSC,
	"ir/kshook-sv6c": ConverterIRKsHookSV6C,
	"ir/kshook-sv6c-static": ConverterKsHookSV6CStatic,
	"ir/lr2hook": ConverterLR2Hook,

	"api/cg-dev-sdvx": ConverterAPICGSDVX,
	"api/cg-dev-museca": ConverterAPICGMuseca,
	"api/cg-dev-popn": ConverterAPICGPopn,
	"api/cg-prod-sdvx": ConverterAPICGSDVX,
	"api/cg-prod-museca": ConverterAPICGMuseca,
	"api/cg-prod-popn": ConverterAPICGPopn,

	// "api/cg-dev-jubeat": ConverterAPICGJubeat,
	// "api/cg-prod-jubeat": ConverterAPICGJubeat,
};
