import { integer, USCAuthDocument, ChartDocument } from "kamaitachi-common";
import { Logger, LeveledLogMethod } from "winston";

declare module "express-session" {
    // Inject additional properties on express-session
    interface SessionData {
        ktchi: KtchiSessionData;
    }
}

export interface KtchiSessionData {
    userID: integer;
    apiKey: string;
}

export interface KTFailResponse {
    success: false;
    description: string;
}

export interface KTSuccessResponse {
    success: true;
    description: string;
    body: Record<string, unknown>;
}

export type KTReponse = KTFailResponse | KTSuccessResponse;

/**
 * Clarity type for empty objects - such as in context.
 */
export type EmptyObject = Record<string, never>;

/**
 * Data that may be monkey-patched onto req.ktchi. This holds things such as middleware results.
 */
export interface KtchiRequestData {
    uscAuthDoc?: USCAuthDocument;
    uscChartDoc?: ChartDocument<"usc:Single">;
}
