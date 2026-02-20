import { api } from "../api/api";

export interface ContactMessageInput {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const ContactService = {
    async sendMessage(input: ContactMessageInput): Promise<void> {
        await api.post("/contact", {
            name: input.name.trim(),
            email: input.email.trim(),
            subject: input.subject.trim(),
            message: input.message.trim(),
        });
    },
};
