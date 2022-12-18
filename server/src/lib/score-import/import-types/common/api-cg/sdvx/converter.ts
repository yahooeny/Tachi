import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "lib/score-import/framework/common/score-utils";
import { FindSDVXChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../types";
import type { CGContext, CGSDVXScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { GPTSupportedVersions, Lamps } from "tachi-common";

export const ConverterAPICGSDVX: ConverterFunction<CGSDVXScore, CGContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const difficulty = ConvertDifficulty(data.difficulty);
	const version = ConvertVersion(data.version);

	const chart = await FindSDVXChartOnInGameIDVersion(data.internalId, difficulty, version);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with songID ${data.internalId} (${difficulty} - Version ${version})`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("sdvx", chart.songID);

	if (!song) {
		logger.severe(`Song-Chart desync with song ID ${chart.songID} (sdvx).`);
		throw new InternalFailure(`Song-Chart desync with song ID ${chart.songID} (sdvx).`);
	}

	const lamp = ConvertCGSDVXLamp(version, data.clearType);

	const { percent, grade } = GenericGetGradeAndPercent("sdvx", data.score, chart);

	const timeAchieved = ParseDateFromString(data.dateTime);

	const dryScore: DryScore<"sdvx:Single"> = {
		comment: null,
		game: "sdvx",
		importType,
		timeAchieved,
		service: context.service,
		scoreData: {
			grade,
			percent,
			score: data.score,
			lamp,
			judgements: {
				critical: data.critical,
				near: data.near,
				miss: data.error,
			},
			hitMeta: {
				maxCombo: data.maxChain,
			},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

function ConvertDifficulty(diff: number) {
	switch (diff) {
		case 0:
			return "NOV";
		case 1:
			return "ADV";
		case 2:
			return "EXH";
		case 3:
			return "ANY_INF";
		case 4:
			return "MXM";
	}

	throw new InvalidScoreFailure(`Invalid difficulty of ${diff} - Could not convert.`);
}

function ConvertVersion(ver: number): GPTSupportedVersions["sdvx:Single"] {
	switch (ver) {
		case 1:
			return "booth";
		case 2:
			return "inf";
		case 3:
			return "gw";
		case 4:
			return "heaven";
		case 5:
			return "vivid";
		case 6:
			return "exceed";
	}

	throw new InvalidScoreFailure(`Unknown Game Version ${ver}.`);
}

/**
 * Convert CG's clearType enum into a Tachi lamp. Note that what numbers mean what are
 * dependent on what version of the game we're listening for.
 */
function ConvertCGSDVXLamp(
	version: GPTSupportedVersions["sdvx:Single"],
	clearType: number
): Lamps["sdvx:Single"] {
	switch (clearType) {
		case 0:
			return "FAILED";
		case 1:
			return "CLEAR";
	}

	// this version doesn't have excessive clears, so the ints are off by one.
	if (version === "booth") {
		switch (clearType) {
			case 2:
				return "ULTIMATE CHAIN";
			case 3:
				return "PERFECT ULTIMATE CHAIN";
		}
	} else {
		switch (clearType) {
			case 2:
				return "EXCESSIVE CLEAR";
			case 3:
				return "ULTIMATE CHAIN";
			case 4:
				return "PERFECT ULTIMATE CHAIN";
		}
	}

	throw new InvalidScoreFailure(
		`Invalid lamp of ${clearType} for ${version} - Could not convert.`
	);
}
