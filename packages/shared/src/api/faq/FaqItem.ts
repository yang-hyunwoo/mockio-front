export type FaqType =
    | "ACCOUNT"
    | "INTERVIEW"
    | "FEEDBACK"
    | "PAYMENT"
    | "TECHNICAL"
    | "ETC";

export interface FaqItem {
    id: number;
    question: string;
    answer: string;
    faqType: {
        code: FaqType,
        label: string
    };
}