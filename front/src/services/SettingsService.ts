import { api } from "../api/api";
import type { UserSettings } from "../types";

type BackendSettings = {
    pushNotifications?: boolean;
    emailNotifications?: boolean;
    commentReplies?: boolean;
    newFollowers?: boolean;
    updatedAt?: string;
};

const defaultSettings: UserSettings = {
    pushNotifications: true,
    emailNotifications: false,
    commentReplies: true,
    newFollowers: false,
};

function normalizeSettings(data?: BackendSettings): UserSettings {
    return {
        pushNotifications: data?.pushNotifications ?? defaultSettings.pushNotifications,
        emailNotifications: data?.emailNotifications ?? defaultSettings.emailNotifications,
        commentReplies: data?.commentReplies ?? defaultSettings.commentReplies,
        newFollowers: data?.newFollowers ?? defaultSettings.newFollowers,
        updatedAt: data?.updatedAt,
    };
}

export const SettingsService = {
    async getMine(): Promise<UserSettings> {
        const res = await api.get<BackendSettings>("/me/settings");
        return normalizeSettings(res.data);
    },

    async updateMine(patch: Partial<UserSettings>): Promise<UserSettings> {
        const res = await api.put<BackendSettings>("/me/settings", patch);
        return normalizeSettings(res.data);
    },
};

