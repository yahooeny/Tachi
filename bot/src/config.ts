import { config } from "dotenv";
import fs from "fs";
import JSON5 from "json5";
import p from "prudence";
// @ts-expect-error No types available...
import fetchSync from "sync-fetch";
import { Game, integer } from "tachi-common";
import { LoggerLayers } from "./data/data";
import { CreateLayeredLogger } from "./utils/logger";
import { IsRecord } from "./utils/predicates";
import { FormatPrError } from "./utils/prudence";
import { ServerConfig as ServerConfigType } from "./utils/return-types";

// Initialise .env.
config();

// Reads the bots config file from $pwd/conf.json5.
// Validates it using prudence.

const logger = CreateLayeredLogger(LoggerLayers.botConfigSetup);

export interface BotConfig {
	TACHI_SERVER_LOCATION: string;
	HTTP_SERVER: {
		URL: string;
		PORT: integer;
	};
	OAUTH: {
		CLIENT_SECRET: string;
		CLIENT_ID: string;
	};
	DISCORD: {
		TOKEN: string;
		SERVER_ID: string;
		GAME_CHANNELS: Partial<Record<Game, string>>;
	};
}

function ParseBotConfig(fileLoc = "conf.json5"): BotConfig {
	let data;

	try {
		const contents = fs.readFileSync(fileLoc, "utf-8");
		data = JSON5.parse(contents);
	} catch (err) {
		logger.error("Failed to find/parse a valid conf.json5 file. Cannot boot.", { err });

		throw err;
	}

	const err = p(data, {
		TACHI_SERVER_LOCATION: "string",
		HTTP_SERVER: {
			URL: "string",
			PORT: p.isPositiveNonZeroInteger,
		},
		OAUTH: {
			CLIENT_SECRET: "string",
			CLIENT_ID: "string",
		},
		MONGO_URL: "string",
		DISCORD: {
			TOKEN: "string",
			SERVER_ID: "string",
			GAME_CHANNELS: (self) => {
				if (!IsRecord(self)) {
					return "Expected an object that maps games to discord channel IDs.";
				}

				for (const [key, value] of Object.entries(self)) {
					// note: properly validating that these are valid games
					// is slightly harder, since that is also controlled by the config.
					// ah well.
					if (typeof key !== "string" || typeof value !== "string") {
						return `Invalid value ${key}:${value}. Expected two strings.`;
					}
				}

				return true;
			},
		},
	});

	if (err) {
		logger.error(FormatPrError(err, "Invalid conf.json5 file. Cannot safely boot."));

		throw err;
	}

	return data;
}

export interface ProcessEnvironment {
	nodeEnv: "production" | "dev" | "staging" | "test";
	mongoUrl: string;
}

function ParseEnvVars() {
	const err = p(
		process.env,
		{
			NODE_ENV: p.isIn("production", "dev", "staging", "test"),
			// mei implicitly reads this.
			LOG_LEVEL: p.optional(
				p.isIn("debug", "verbose", "info", "warn", "error", "severe", "crit")
			),
			MONGO_URL: "string",
		},
		{},
		{ allowExcessKeys: true }
	);

	if (err) {
		logger.error(FormatPrError(err, "Invalid environment. Cannot safely boot."));

		throw err;
	}

	return {
		nodeEnv: process.env.NODE_ENV,
		mongoUrl: process.env.MONGO_URL,
	} as ProcessEnvironment;
}

export const BotConfig: BotConfig = ParseBotConfig(process.env.CONF_JSON5_LOCATION);

// The Tachi Server exports all of the information about it. This saves us having to
// sync more metadata across instances.
function GetServerConfig() {
	// Yes, I know synchronous fetch is disgusting. However, we can't do anything until
	// this fetch is complete, and it saves us having to do a singleton pattern or worse.
	// This *should* be solved with top-level-await, but good luck actually getting
	// typescript to output the right stuff here.
	const res = fetchSync(`${BotConfig.TACHI_SERVER_LOCATION}/api/v1/config`).json();

	if (!res.success) {
		logger.crit(
			`Failed to fetch server info from ${BotConfig.TACHI_SERVER_LOCATION}. Can't run.`
		);
		process.exit(1);
	}

	return res.body as ServerConfigType;
}

export const ServerConfig = GetServerConfig();

export const ProcessEnv = ParseEnvVars();

// General warnings for config misuse.
// This warns people if their parent server supports games that they aren't acknowledging.
for (const game of ServerConfig.games) {
	if (!Object.prototype.hasOwnProperty.call(BotConfig.DISCORD.GAME_CHANNELS, game)) {
		logger.warn(
			`${ServerConfig.name} declares support for ${game}, but no channel is mapped to it in your conf.json5.`
		);
	}
}
